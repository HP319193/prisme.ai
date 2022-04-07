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
        depth: 0,
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

  async fetch() {
    const global = await this.cache.getObject<GlobalContext>(
      this.cacheKey(ContextType.Global)
    );
    const run = await this.cache.getObject<RunContext>(
      this.cacheKey(ContextType.Run)
    );
    const user = this.userId
      ? await this.cache.getObject<UserContext>(this.cacheKey(ContextType.User))
      : {};
    const session = await this.cache.getObject(
      this.cacheKey(ContextType.Session)
    );

    this.contexts = this.merge({
      global,
      run,
      user,
      session,
      local: this.contexts[ContextType.Local],
    });
  }

  async save(context?: ContextType, ttl?: number) {
    const { global, run, user, local: _, config, session } = this.contexts;

    if (!context || context === ContextType.Global) {
      await this.cache.setObject(this.cacheKey(ContextType.Global), global);
    }
    if (!context || context === ContextType.Run) {
      await this.cache.setObject(this.cacheKey(ContextType.Run), run, {
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
    return this.contexts.run;
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
    const run: Partial<RunContext> = opts.appContext
      ? {
          ...opts.appContext,
          parentAppSlug:
            (opts.appContext.parentAppSlugs?.length || 0) > 1
              ? opts.appContext.parentAppSlugs[
                  opts.appContext.parentAppSlugs.length - 2
                ]
              : undefined,
          automationSlug: opts.automationSlug,
        }
      : { automationSlug: opts.automationSlug };
    // We do not want to reinstantiate contexts.session/user/global objects as they would prevent calling automations to receive updated fields from their called automations
    // TODO Problem still exists for run context & any other 'additionalContexts' (i.e config)
    const child = Object.assign({}, this, {
      contexts: {
        ...this.contexts,
        local: resetLocal
          ? opts.payload || {}
          : { ...this.contexts[ContextType.Local], ...opts.payload },
        run: {
          ...this.run,
          ...run,
          correlationId: this.contexts?.run?.correlationId,
        },
        ...additionalContexts,
      },
      payload: { ...(opts.payload || {}) },
      broker: opts.broker || this.broker,
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
        parent[lastKey] = _.cloneDeep(value);
      }
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
    };
  }

  async securityChecks() {
    if (this.run.depth > MAXIMUM_SUCCESSIVE_CALLS) {
      throw new TooManyCallError('Reached maximum number of successive calls', {
        limit: MAXIMUM_SUCCESSIVE_CALLS,
      });
    }
    // TODO check memory usage
    this.run.depth++;

    await this.save(ContextType.Run);
  }
}
