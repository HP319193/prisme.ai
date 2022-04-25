import { Broker } from '@prisme.ai/broker';
import _ from 'lodash';
import {
  CONTEXT_RUN_EXPIRE_TIME,
  CONTEXT_SESSION_EXPIRE_TIME,
  MAXIMUM_SUCCESSIVE_CALLS,
} from '../../../config';
import { CacheDriver } from '../../cache';
import { InvalidSetInstructionError, TooManyCallError } from '../../errors';
import { Logger, logger } from '../../logger';
import { EventType } from '../../eda';
import { parseVariableName, SplittedPath } from '../../utils/parseVariableName';
import { AppContext } from '../workspaces';

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

// This contexts holds internal information about current run
// and expires with last executed instruction
// A run can span over multiple events & automations in a row, all bound to the same correlationId
export interface RunContext {
  depth: number; // Depth of current automation.
  correlationId: string;
  automationSlug?: string;
  date?: string; // ISO8601 date

  // Only set if running inside an app instance :
  appSlug?: string; // App unique slug
  appInstanceSlug?: string; // Current instance slug defined by parent workspace/app
  appInstanceFullSlug?: string; // Current instance full slug (from root workspace)
  parentAppSlug?: string; // Only if parent context is also an app instance
}

export interface GlobalContext {
  workspaceId: string;
  [k: string]: any;
}

export interface UserContext {
  id?: string;
  [k: string]: any;
}

// Holds local variables from current automation. Never persisted
export type LocalContext = any;

export interface Contexts {
  run: RunContext;
  global: GlobalContext;
  user: UserContext;
  session: Record<string, any>;
  local: LocalContext;
  config: object;
}

export enum ContextType {
  Run = 'run',
  Global = 'global',
  User = 'user',
  Session = 'session',
  Config = 'config',
  Local = 'local',
}

type PublicContexts = Omit<Contexts, 'run'>;

export const UserAccessibleContexts: ContextType[] = [
  ContextType.Global,
  ContextType.User,
  ContextType.Session,
  ContextType.Config,
  ContextType.Run,
];
export class ContextsManager {
  private workspaceId: string;
  private userId?: string;
  private correlationId: string;
  private cache: CacheDriver;
  private contexts: Contexts;
  private logger: Logger;
  private broker: Broker;

  public payload: any;
  private depth: number;
  private appContext?: AppContext;
  private automationSlug?: string;

  constructor(
    workspaceId: string,
    userId: string,
    correlationId: string,
    cache: CacheDriver,
    payload: any = {},
    broker: Broker
  ) {
    this.workspaceId = workspaceId;
    this.userId = userId;
    this.correlationId = correlationId;
    this.cache = cache;
    this.depth = 0;
    this.contexts = {
      local: { ...payload },
      global: {
        workspaceId,
      },
      user: {
        id: userId,
      },
      session: {},
      config: {},
      run: {
        depth: this.depth,
        correlationId,
      },
    };
    this.logger = logger.child({
      userId,
      workspaceId,
      correlationId,
    });

    this.payload = payload || {};
    this.broker = broker;
  }

  private merge(additionalContexts: RecursivePartial<Contexts> = {}) {
    return {
      ...this.contexts,
      ...additionalContexts,
      config: additionalContexts.config || this.contexts.config || {},
      global: {
        ...this.contexts?.global,
        ...additionalContexts?.global,
        workspaceId: this.workspaceId,
      },
      user: {
        ...this.contexts?.user,
        ...additionalContexts?.user,
        id: this.userId,
      },
      run: {
        ...this.contexts?.run,
        ...additionalContexts?.run,
        correlationId: this.correlationId,
      },
      session: {
        ...this.contexts?.session,
        ...additionalContexts?.session,
      },
    };
  }

  async fetch(contexts?: ContextType[]) {
    const fetchedContexts: Partial<Contexts> = {};

    if (!contexts || contexts.includes(ContextType.Global)) {
      fetchedContexts.global = await this.cache.getObject<GlobalContext>(
        this.cacheKey(ContextType.Global)
      );
    }

    if (!contexts || contexts.includes(ContextType.Run)) {
      fetchedContexts.run = await this.cache.getObject<RunContext>(
        this.cacheKey(ContextType.Run)
      );
    }

    if (!contexts || contexts.includes(ContextType.User)) {
      fetchedContexts.user = this.userId
        ? await this.cache.getObject<UserContext>(
            this.cacheKey(ContextType.User)
          )
        : {};
    }
    if (!contexts || contexts.includes(ContextType.Session)) {
      fetchedContexts.session = await this.cache.getObject(
        this.cacheKey(ContextType.Session)
      );
    }

    this.contexts = this.merge(fetchedContexts);

    // Restore previous depth
    if (fetchedContexts?.run?.depth) {
      this.depth = fetchedContexts.run.depth;
    }
  }

  async save(context?: ContextType, ttl?: number) {
    const { global, user, local: _, config, session } = this.contexts;

    if (!context || context === ContextType.Global) {
      await this.cache.setObject(this.cacheKey(ContextType.Global), global);
    }
    if (!context || context === ContextType.Run) {
      await this.cache.setObject(this.cacheKey(ContextType.Run), this.run, {
        ttl: ttl || CONTEXT_RUN_EXPIRE_TIME,
      });
    }
    if ((!context || context === ContextType.User) && this.userId) {
      await this.cache.setObject(this.cacheKey(ContextType.User), user);
    }
    if (!context || context === ContextType.Session) {
      await this.cache.setObject(this.cacheKey(ContextType.Session), session, {
        ttl: CONTEXT_SESSION_EXPIRE_TIME,
      });
    }

    if (context === ContextType.Config) {
      await this.broker.send<Prismeai.UpdatedContexts['payload']>(
        EventType.UpdatedContexts,
        {
          contexts: {
            config,
          },
        },
        undefined,
        // Current broker instance topic is normally emit's one, so we have to switch to native events topic :
        EventType.UpdatedContexts
      );
    }
  }

  private cacheKey(context: Omit<ContextType, ContextType.Local>) {
    if (context === ContextType.User) {
      return `contexts:${this.workspaceId}:user:${this.userId}`;
    }
    if (context === ContextType.Global) {
      return `contexts:${this.workspaceId}:global`;
    }
    if (context === ContextType.Run) {
      return `contexts:${this.workspaceId}:run:${this.correlationId}`;
    }
    if (context === ContextType.Session) {
      const sessionId = this.userId || this.correlationId;
      return `contexts:${this.workspaceId}:session:${sessionId}`;
    }
    throw new Error(`Unknown context '${context} inside context store'`);
  }

  get global(): GlobalContext {
    return this.contexts.global;
  }

  get user(): UserContext {
    return this.contexts.user;
  }

  get run(): RunContext {
    return {
      ...this.contexts.run,
      ...this.appContext,
      automationSlug: this.automationSlug,
      correlationId: this.correlationId,
      depth: this.depth,
      date: new Date().toISOString(),
    };
  }

  // Reinstantiate a new ContextsManager for a child execution context
  child(
    additionalContexts: RecursivePartial<Contexts> = {},
    opts: {
      resetLocal?: boolean;
      payload?: any;
      appContext?: AppContext;
      broker?: Broker;
      automationSlug: string;
    }
  ): ContextsManager {
    const resetLocal =
      typeof opts.resetLocal !== 'undefined' ? opts.resetLocal : true;

    // We do not want to reinstantiate contexts.session/user/global objects as they would prevent calling automations to receive updated fields from their called automations
    // TODO Problem still exists for any other 'additionalContexts' (i.e config)
    const child = Object.assign({}, this, {
      contexts: {
        ...this.contexts,
        local: resetLocal
          ? opts.payload || {}
          : { ...this.contexts[ContextType.Local], ...opts.payload },
        ...additionalContexts,
      },
      payload: { ...(opts.payload || this.payload || {}) },
      broker: opts.broker || this.broker,
      appContext: opts.appContext || this.appContext,
      automationSlug: opts.automationSlug || this.automationSlug,
    });

    Object.setPrototypeOf(child, ContextsManager.prototype);
    return child;
  }

  private findParentVariableFor(splittedPath: SplittedPath) {
    const rootVarName = splittedPath[0];
    const lastKey = splittedPath[splittedPath.length - 1];

    const context: ContextType = UserAccessibleContexts.includes(
      rootVarName as ContextType
    )
      ? (rootVarName as ContextType)
      : ContextType.Local;

    let parent =
      context === ContextType.Local
        ? this.contexts[ContextType.Local]
        : this.contexts;
    for (let i = 0; i < splittedPath.length - 1; i++) {
      const key = splittedPath[i];
      if (!(key in parent)) {
        parent[key] = {};
      }
      parent = parent[key];
    }

    return {
      parent,
      lastKey,
      context,
    };
  }

  async set(path: string, value: any, ttl?: number) {
    const arrayPush = path.endsWith('[]');
    if (arrayPush) {
      path = path.slice(0, -2);
    }

    const splittedPath = parseVariableName(path);

    try {
      const { parent, lastKey, context } =
        this.findParentVariableFor(splittedPath);
      if (arrayPush) {
        if (!Array.isArray(parent[lastKey])) {
          parent[lastKey] = [];
        }
        parent[lastKey].push(_.cloneDeep(value));
      } else {
        const prevValue = parent[lastKey];
        parent[lastKey] = _.cloneDeep(value);

        // Handle user/session switching
        if (
          context === ContextType.User &&
          lastKey === 'id' &&
          prevValue !== value
        ) {
          this.userId = value;
          await this.fetch([ContextType.User, ContextType.Session]);
          this.broker.parentSource.userId = value;
          return;
        }
      }
      // Persist
      await this.save(context, ttl);
    } catch (error) {
      this.logger.error(error);
      throw new InvalidSetInstructionError('Invalid set instruction', {
        variable: path,
        value,
      });
    }
  }

  async delete(path: string) {
    const splittedPath = parseVariableName(path);

    const { parent, lastKey, context } =
      this.findParentVariableFor(splittedPath);
    delete parent[lastKey];
    await this.save(context);
  }

  get publicContexts(): PublicContexts {
    const { local, ...publicContexts } = this.contexts;
    return {
      ...local,
      ...publicContexts,
      run: this.run,
    };
  }

  async securityChecks() {
    if (this.depth > MAXIMUM_SUCCESSIVE_CALLS) {
      throw new TooManyCallError('Reached maximum number of successive calls', {
        limit: MAXIMUM_SUCCESSIVE_CALLS,
      });
    }
    // TODO check memory usage
    this.depth++;

    await this.save(ContextType.Run);
  }
}
