import { Broker } from '@prisme.ai/broker';
import _ from 'lodash';
import {
  CONTEXT_RUN_EXPIRE_TIME,
  CONTEXT_UNAUTHENTICATED_SESSION_EXPIRE_TIME,
  MAXIMUM_SUCCESSIVE_CALLS,
  SYNCHRONIZE_CONTEXTS,
} from '../../../config';
import { Cache } from '../../cache';
import { InvalidInstructionError, TooManyCallError } from '../../errors';
import { Logger, logger } from '../../logger';
import { EventType } from '../../eda';
import { parseVariableName, SplittedPath } from '../../utils/parseVariableName';
import { AppContext, DetailedAutomation } from '../workspaces';
import { findSecretValues } from '../../utils/secrets';
import { PrismeContext } from '../../api/middlewares';
import { AccessManager, ActionType, SubjectType } from '../../permissions';

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
  ip?: string;

  // Only set if running inside an app instance :
  appSlug?: string; // App unique slug
  appInstanceSlug?: string; // Current instance slug defined by parent workspace/app
  appInstanceFullSlug?: string; // Current instance full slug (from root workspace)
  parentAppSlug?: string; // Only if parent context is also an app instance
}

export interface Trigger {
  type: 'event' | 'endpoint' | 'schedule' | 'automation';
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
  role?: string;
  email?: string;
  authData?: Record<string, any>;
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
  public cache: Cache;
  private contexts: Contexts;
  private logger: Logger;
  private broker: Broker;

  public payload: any;
  public depth: number;
  private appContext?: AppContext;
  public trigger?: Trigger;
  private automationSlug?: string;
  public additionalGlobals?: Record<string, any>;
  public secrets: Set<string>;

  private opLogs: ContextUpdateOpLog[];
  private alreadyProcessedUpdateIds: Set<string>;
  private accessManager: Required<AccessManager>;

  constructor(
    ctx: PrismeContext,
    session: PrismeaiSession,
    cache: Cache,
    broker: Broker,
    accessManager: AccessManager
  ) {
    this.workspaceId = ctx.workspaceId!;
    this.session = session;
    this.correlationId = ctx.correlationId;
    this.cache = cache;
    this.depth = ctx.automationDepth || 0;
    this.contexts = {
      $workspace: {},
      local: {},
      global: {
        workspaceId: ctx.workspaceId!,
      },
      user: {
        id: session.userId,
      },
      session: {},
      config: {},
      run: {
        depth: this.depth,
        correlationId: ctx.correlationId!,
        ip: ctx.ip,
      },
    };
    this.logger = logger.child({
      userId: session.userId,
      workspaceId: ctx.workspaceId,
      correlationId: ctx.correlationId,
    });

    this.payload = {};
    this.broker = broker;
    this.secrets = new Set();
    this.opLogs = [];
    this.alreadyProcessedUpdateIds = new Set();
    this.accessManager = accessManager as any;
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

    if (fetchedContexts.user) {
      this.accessManager = await this.accessManager.as({
        id: this.session?.userId!,
        sessionId: this.session?.sessionId,
      });
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
        ttl:
          this.session?.expiresIn ||
          CONTEXT_UNAUTHENTICATED_SESSION_EXPIRE_TIME,
      });
    }

    const updates = this.opLogs.filter((cur) =>
      SYNCHRONIZE_CONTEXTS.includes(cur.context)
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
        {},
        {
          options: {
            persist: false,
          },
        },
        true
      );
      if (updatedEvent !== false) {
        this.alreadyProcessedUpdateIds.add(updatedEvent.id);
      }
    }
  }

  public async applyUpdateOpLogs(
    updates: ContextUpdateOpLog[],
    updateId: string,
    sourceSessionId: string
  ) {
    if (this.alreadyProcessedUpdateIds.has(updateId)) {
      return;
    }
    this.alreadyProcessedUpdateIds.add(updateId);
    for (const update of updates) {
      // For user/session op logs, check that they come from the same sessionId
      if (
        (update.context === ContextType.User ||
          update.context === ContextType.Session) &&
        sourceSessionId &&
        sourceSessionId !== this.session?.sessionId
      ) {
        continue;
      }
      await this.set(update.fullPath, update.value, {
        persist: false,
        type: update.type,
      });
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
    return this.publicContexts.global;
  }

  get user(): UserContext {
    return this.publicContexts.user;
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
        local: _.cloneDeep(opts.payload || {}),
        ...additionalContexts,
      },
      payload: _.cloneDeep(opts.payload),
      broker: opts.broker || this.broker,
      appContext: opts.appContext || this.appContext,
      automationSlug: opts.automationSlug || this.automationSlug,
      additionalGlobals: {
        ...this.additionalGlobals,
        ...opts.additionalGlobals,
      },
      trigger: opts.trigger || this.trigger,
      opLogs: [],
    });

    Object.setPrototypeOf(child, ContextsManager.prototype);
    return child;
  }

  async childAutomation(
    automation: DetailedAutomation,
    payload: any,
    broker: Broker,
    trigger?: Trigger
  ): Promise<ContextsManager> {
    await this.accessManager.throwUnlessCan(
      ActionType.Execute,
      SubjectType.Automation,
      automation
    );

    findSecretValues(payload, automation.secretPaths, this.secrets);
    automation.workspace.secrets.forEach((secret) => this.secrets.add(secret));

    const child = this.child(
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
      if (!(key in parent) || parent[key] == undefined || parent[key] == null) {
        parent[key] = {};
      }
      parent = parent[key];
    }

    return {
      parent,
      lastKey,
      context,
      subPath:
        context !== ContextType.Local // If anything else than local context, remove first part as it specifies which context
          ? splittedPath.slice(1).join('.')
          : `${splittedPath[0]}`,
    };
  }

  async set(
    path: string,
    value: any,
    opts?: {
      ttl?: number;
      persist?: boolean;
      type?: Prismeai.ContextSetType;
    }
  ) {
    const { ttl, persist = true } = opts || {};
    let type: Prismeai.ContextSetType = opts?.type || 'replace';
    if ((path || '').endsWith('[]')) {
      type = 'push';
      path = path.slice(0, -2);
    }
    const splittedPath = parseVariableName(path);

    try {
      const { parent, lastKey, context, subPath } =
        this.findParentVariableFor(splittedPath);
      const prevValue = parent[lastKey];

      const opLog: ContextUpdateOpLog = {
        type,
        path: subPath,
        fullPath: path,
        context,
        value,
      };

      if (type == 'delete') {
        delete parent[lastKey];
      } else if (
        type === 'push' ||
        (opts?.type == 'merge' && Array.isArray(prevValue))
      ) {
        // Push to an array
        if (!Array.isArray(parent[lastKey])) {
          parent[lastKey] = [];
        }
        if (opts?.type == 'merge' && Array.isArray(value)) {
          parent[lastKey].push(..._.cloneDeep(value));
        } else {
          parent[lastKey].push(_.cloneDeep(value));
        }
      } else if (type == 'merge' && typeof prevValue === 'object') {
        // Merge 2 objects together
        if (typeof value !== 'object' || Array.isArray(value)) {
          return;
        }
        parent[lastKey] = { ...parent[lastKey], ..._.cloneDeep(value) };
      } else {
        // Replace target var with given value
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
        } else if (
          context === ContextType.Session &&
          lastKey === 'id' &&
          prevValue !== value
        ) {
          const targetSession = await this.cache.getSession(value);
          const userId = targetSession?.userId || value;
          this.contexts.user = { id: userId };
          this.session = targetSession || {
            userId: value,
            sessionId: value,
            authData: {},
          };
          this.contexts.session = { id: value };
          await this.fetch([ContextType.User, ContextType.Session]);
          this.broker.parentSource.userId = userId;
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
    await this.set(path, undefined, {
      persist,
      type: 'delete',
    });
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
        role: this.accessManager
          ? this.accessManager.getLoadedSubjectRole(
              SubjectType.Workspace,
              this.workspaceId
            )
          : undefined,
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
      throw new TooManyCallError('Reached maximum number of nested calls', {
        limit: MAXIMUM_SUCCESSIVE_CALLS,
      });
    }
    // TODO check memory usage
    this.depth++;
  }
}
