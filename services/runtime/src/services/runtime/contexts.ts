import { Broker } from '@prisme.ai/broker';
import _ from 'lodash';
import {
  CONTEXT_RUN_EXPIRE_TIME,
  MAXIMUM_SUCCESSIVE_CALLS,
} from '../../../config';
import { CacheDriver } from '../../cache';
import { InvalidInstructionError, TooManyCallError } from '../../errors';
import { Logger, logger } from '../../logger';
import { EventType } from '../../eda';
import { parseVariableName, SplittedPath } from '../../utils/parseVariableName';
import { AppContext, DetailedAutomation } from '../workspaces';
import { findSecretValues } from '../../utils/secrets';

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
  trigger?: Trigger; // Current call origin (event/endpoint/automation)

  // Only set if running inside an app instance :
  appSlug?: string; // App unique slug
  appInstanceSlug?: string; // Current instance slug defined by parent workspace/app
  appInstanceFullSlug?: string; // Current instance full slug (from root workspace)
  parentAppSlug?: string; // Only if parent context is also an app instance
}

export interface Trigger {
  type: 'event' | 'endpoint' | 'automation';
  value: string;
  id?: string;
}

export interface PrismeaiSession {
  userId: string;
  email?: string;
  authData: Prismeai.User['authData'];
  sessionId: string;
  token?: string;
  expiresIn?: number;
  expires?: string;
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
  $workspace: Partial<Prismeai.DSUL>;
}

export type ContextUpdateOpLog =
  Prismeai.UpdatedContexts['payload']['updates'][0];

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
  public workspaceId: string;
  public session?: PrismeaiSession;
  private correlationId: string;
  public cache: CacheDriver;
  private contexts: Contexts;
  private logger: Logger;
  private broker: Broker;

  public payload: any;
  private depth: number;
  private appContext?: AppContext;
  public trigger?: Trigger;
  private automationSlug?: string;
  public additionalGlobals?: Record<string, any>;
  public secrets: Set<string>;

  private opLogs: ContextUpdateOpLog[];
  private alreadyProcessedUpdateIds: Set<string>;

  constructor(
    workspaceId: string,
    session: PrismeaiSession,
    correlationId: string,
    cache: CacheDriver,
    broker: Broker
  ) {
    this.workspaceId = workspaceId;
    this.session = session;
    this.correlationId = correlationId;
    this.cache = cache;
    this.depth = 0;
    this.contexts = {
      $workspace: {},
      local: {},
      global: {
        workspaceId,
      },
      user: {
        id: session.userId,
      },
      session: {},
      config: {},
      run: {
        depth: this.depth,
        correlationId,
      },
    };
    this.logger = logger.child({
      userId: session.userId,
      workspaceId,
      correlationId,
    });

    this.payload = {};
    this.broker = broker;
    this.secrets = new Set();
    this.opLogs = [];
    this.alreadyProcessedUpdateIds = new Set();
  }

  async fetch(contexts?: ContextType[]) {
    const fetchedContexts: Partial<Contexts> = {};

    if (!contexts || contexts.includes(ContextType.Global)) {
      fetchedContexts.global = await this.cache.getObject<GlobalContext>(
        this.cacheKey(ContextType.Global)
      );
      this.contexts.global = {
        ...this.contexts?.global,
        ...fetchedContexts.global,
        workspaceId: this.workspaceId,
      };
    }

    if (!contexts || contexts.includes(ContextType.Run)) {
      fetchedContexts.run = await this.cache.getObject<RunContext>(
        this.cacheKey(ContextType.Run)
      );
      this.contexts.run = {
        ...this.contexts?.run,
        ...fetchedContexts.run,
        correlationId: this.correlationId,
      };
    }

    if (!contexts || contexts.includes(ContextType.User)) {
      fetchedContexts.user =
        (this.session?.userId &&
          (await this.cache.getObject<UserContext>(
            this.cacheKey(ContextType.User)
          ))) ||
        {};
      this.contexts.user = {
        ...this.contexts?.user,
        ...fetchedContexts.user,
        id: this.session?.userId,
      };
    }
    if (!contexts || contexts.includes(ContextType.Session)) {
      fetchedContexts.session = await this.cache.getObject(
        this.cacheKey(ContextType.Session)
      );
      this.contexts.session = {
        ...this.contexts?.session,
        ...fetchedContexts.session,
      };
    }

    // Restore previous depth
    if (fetchedContexts?.run?.depth) {
      this.depth = fetchedContexts.run.depth;
    }
  }

  async save(context?: ContextType, ttl?: number) {
    const { global, user, local: _, session } = this.contexts;

    if (!context || context === ContextType.Global) {
      await this.cache.setObject(this.cacheKey(ContextType.Global), global);
    }
    if (!context || context === ContextType.Run) {
      await this.cache.setObject(this.cacheKey(ContextType.Run), this.run, {
        ttl: ttl || CONTEXT_RUN_EXPIRE_TIME,
      });
    }
    if ((!context || context === ContextType.User) && this.session?.userId) {
      await this.cache.setObject(this.cacheKey(ContextType.User), user);
    }
    if (!context || context === ContextType.Session) {
      await this.cache.setObject(this.cacheKey(ContextType.Session), session, {
        ttl: this.session?.expiresIn || 60 * 15,
      });
    }

    const updates = this.opLogs.filter(
      (cur) =>
        cur.context === ContextType.Config || cur.context === ContextType.Run
    );

    this.opLogs = [];
    if (updates.length) {
      const updatedEvent = await this.broker.send<
        Prismeai.UpdatedContexts['payload']
      >(
        EventType.UpdatedContexts,
        {
          updates,
        },
        undefined,
        // Current broker instance topic is normally emit's one, so we have to switch to native events topic :
        EventType.UpdatedContexts
      );
      this.alreadyProcessedUpdateIds.add(updatedEvent.id);
    }
  }

  public async applyUpdateOpLogs(
    updates: ContextUpdateOpLog[],
    updateId: string
  ) {
    if (this.alreadyProcessedUpdateIds.has(updateId)) {
      return;
    }
    this.alreadyProcessedUpdateIds.add(updateId);
    for (const update of updates) {
      const path =
        update.type === 'push' ? update.fullPath + '[]' : update.fullPath;
      if (update.type === 'set' || update.type === 'push') {
        await this.set(path, update.value, undefined, false);
      } else if (update.type === 'delete') {
        await this.set(path, false);
      }
    }
  }

  private cacheKey(context: Omit<ContextType, ContextType.Local>) {
    if (context === ContextType.User) {
      return `contexts:${this.workspaceId}:user:${this.session?.userId}`;
    }
    if (context === ContextType.Global) {
      return `contexts:${this.workspaceId}:global`;
    }
    if (context === ContextType.Run) {
      return `contexts:${this.workspaceId}:run:${this.correlationId}`;
    }
    if (context === ContextType.Session) {
      const sessionId =
        this.session?.sessionId || this.session?.userId || this.correlationId;
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
      trigger: this.trigger,
    };
  }

  // Reinstantiate a new ContextsManager for a child execution context
  private child(
    additionalContexts: RecursivePartial<Contexts> = {},
    opts: {
      payload: any;
      appContext?: AppContext;
      broker?: Broker;
      automationSlug: string;
      additionalGlobals?: any;
      trigger?: Trigger;
    }
  ): ContextsManager {
    // We do not want to reinstantiate contexts.session/user/global objects as they would prevent calling automations to receive updated fields from their called automations
    // TODO Problem still exists for any other 'additionalContexts' (i.e config)
    const child = Object.assign({}, this, {
      contexts: {
        ...this.contexts,
        local: opts.payload || {},
        ...additionalContexts,
      },
      payload: opts.payload,
      broker: opts.broker || this.broker,
      appContext: opts.appContext || this.appContext,
      automationSlug: opts.automationSlug || this.automationSlug,
      additionalGlobals: {
        ...this.additionalGlobals,
        ...opts.additionalGlobals,
      },
      trigger: opts.trigger || this.trigger,
    });

    Object.setPrototypeOf(child, ContextsManager.prototype);
    return child;
  }

  childAutomation(
    automation: DetailedAutomation,
    payload: any,
    broker: Broker,
    trigger?: Trigger
  ): ContextsManager {
    findSecretValues(payload, automation.secretPaths, this.secrets);
    automation.workspace.secrets.forEach((secret) => this.secrets.add(secret));

    return this.child(
      {
        config: automation.workspace.config,
        $workspace: automation.workspace.dsul,
      },
      {
        // If we do not reinstantiate payload, writting to local context might mutate this payload (& produces output-related errors)
        payload: { ...payload },
        appContext: automation.workspace?.appContext,
        broker: broker,
        automationSlug: automation.slug!,
        additionalGlobals: {
          endpoints: automation.workspace.getEndpointUrls(this.workspaceId),
        },
        trigger: trigger || {
          type: 'automation',
          value: this.automationSlug || '',
        },
      }
    );
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
      subPath:
        splittedPath.length > 1 && context !== ContextType.Local
          ? splittedPath.slice(1).join('.')
          : `${splittedPath[0]}`,
    };
  }

  async set(path: string, value: any, ttl?: number, persist = true) {
    const arrayPush = path.endsWith('[]');
    if (arrayPush) {
      path = path.slice(0, -2);
    }

    const splittedPath = parseVariableName(path);

    try {
      const { parent, lastKey, context, subPath } =
        this.findParentVariableFor(splittedPath);
      const opLog: ContextUpdateOpLog = {
        type: arrayPush ? 'push' : 'set',
        path: subPath,
        fullPath: path,
        context,
        value,
      };

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
          this.contexts.user = { id: value };
          this.session = { userId: value, sessionId: value, authData: {} };
          this.contexts.session = { id: value };
          await this.fetch([ContextType.User, ContextType.Session]);
          this.broker.parentSource.userId = value;
          return;
        }
      }
      // Persist
      if (persist) {
        this.opLogs.push(opLog);
        await this.save(context, ttl);
      }
    } catch (error) {
      this.logger.error(error);
      throw new InvalidInstructionError('Invalid set instruction', {
        variable: path,
        value,
      });
    }
  }

  async delete(path: string, persist = true) {
    const splittedPath = parseVariableName(path);

    const { parent, lastKey, context, subPath } =
      this.findParentVariableFor(splittedPath);
    delete parent[lastKey];
    if (persist) {
      await this.save(context);
      this.opLogs.push({
        type: 'delete',
        path: subPath,
        fullPath: path,
        context,
      });
    }
  }

  get publicContexts(): PublicContexts {
    const { local, global, session, ...publicContexts } = this.contexts;
    return {
      ...local,
      ...publicContexts,
      user: {
        ...publicContexts.user,
        email: this.session?.email,
        authData: this.session?.authData,
      },
      session: {
        ...session,
        id: this.session?.sessionId,
      },
      run: this.run,
      global: {
        ...global,
        ...this.additionalGlobals,
        workspaceId: this.workspaceId,
      },
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
