import {
  CONTEXT_RUN_EXPIRE_TIME,
  CONTEXT_SESSION_EXPIRE_TIME,
  MAXIMUM_SUCCESSIVE_CALLS,
} from '../../../config';
import { CacheDriver } from '../../cache';
import { InvalidSetInstructionError, TooManyCallError } from '../../errors';
import { Logger, logger } from '../../logger';
import { parseVariableName, SplittedPath } from '../../utils/parseVariableName';

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

// This contexts holds internal information about current run
// and expires with last executed instruction
// A run can span over multiple events & automations in a row, all bound to the same correlationId
export interface RunContext {
  depth: number; // Depth of current automation.
  correlationId: string;
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
export type LocalContext = Record<string, any>;

export interface Contexts {
  run: RunContext;
  global: GlobalContext;
  user: UserContext;
  session: Record<string, any>;
  local: LocalContext;
  [k: string]: object;
}

export enum ContextType {
  Run = 'run',
  Global = 'global',
  User = 'user',
  Session = 'session',
  Customs = 'customs',
  Local = 'local',
}

type PublicContexts = Omit<Contexts, 'run'>;

export const UserAccessibleContexts: ContextType[] = [
  ContextType.Global,
  ContextType.User,
  ContextType.Session,
];
export class ContextsManager {
  private workspaceId: string;
  private userId?: string;
  private correlationId: string;
  private cache: CacheDriver;
  private contexts: Contexts;
  private logger: Logger;

  public payload: any;

  constructor(
    workspaceId: string,
    userId: string,
    correlationId: string,
    cache: CacheDriver,
    payload: any = {}
  ) {
    this.workspaceId = workspaceId;
    this.userId = userId;
    this.correlationId = correlationId;
    this.cache = cache;
    this.contexts = this.default({
      local: { ...payload },
    });
    this.logger = logger.child({
      userId,
      workspaceId,
      correlationId,
    });

    this.payload = payload || {};
  }

  private default(additionalContexts: RecursivePartial<Contexts> = {}) {
    return {
      local: {},
      ...additionalContexts,
      global: {
        ...(additionalContexts?.global || {}),
        workspaceId: this.workspaceId,
      },
      user: {
        ...(additionalContexts?.user || {}),
        id: this.userId,
      },
      run: {
        depth: 0,
        payload: {},
        ...(additionalContexts?.run || {}),
        correlationId: this.correlationId,
      },
      session: {
        ...(additionalContexts?.session || {}),
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
    const customs = await this.cache.getObject(
      this.cacheKey(ContextType.Customs)
    );
    const session = await this.cache.getObject(
      this.cacheKey(ContextType.Session)
    );

    this.contexts = this.default({
      ...(customs || {}),
      global,
      run,
      user,
      session,
      local: this.contexts[ContextType.Local],
    });
  }

  async save(context?: ContextType) {
    const { global, run, user, local: _, session, ...customs } = this.contexts;

    if (!context || context === ContextType.Global) {
      await this.cache.setObject(this.cacheKey(ContextType.Global), global);
    }
    if (!context || context === ContextType.Run) {
      await this.cache.setObject(this.cacheKey(ContextType.Run), run, {
        ttl: CONTEXT_RUN_EXPIRE_TIME,
      });
    }
    if ((!context || context === ContextType.User) && this.userId) {
      await this.cache.setObject(this.cacheKey(ContextType.User), user);
    }
    if (!context || context === ContextType.Customs) {
      await this.cache.setObject(this.cacheKey(ContextType.Customs), customs);
    }
    if (!context || context === ContextType.Session) {
      await this.cache.setObject(this.cacheKey(ContextType.Session), session, {
        ttl: CONTEXT_SESSION_EXPIRE_TIME,
      });
    }
  }

  private cacheKey(context: ContextType | string) {
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
    return `contexts:${this.workspaceId}:user:${this.userId}:customs`;
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
  child(opts: { resetLocal?: boolean; payload?: any } = {}): ContextsManager {
    const childContexts: Contexts = {
      ...this.contexts,
      // If keeping local context, reinstantiate it to avoid parents context corruption by their children
      local:
        opts.resetLocal || true
          ? opts.payload || {}
          : { ...this.contexts[ContextType.Local], ...opts.payload },
    };
    const child = Object.assign({}, this, {
      contexts: childContexts,
      payload: { ...(opts.payload || {}) },
    });
    Object.setPrototypeOf(child, ContextsManager.prototype);
    return child;
  }

  private findParentVariableFor(splittedPath: SplittedPath) {
    const rootVarName = splittedPath[0];
    const lastKey = splittedPath[splittedPath.length - 1];

    const context: any = UserAccessibleContexts.includes(
      rootVarName as ContextType
    )
      ? this.contexts
      : this.contexts[ContextType.Local];

    let parent = context;
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
    };
  }

  set(path: string, value: any) {
    const splittedPath = parseVariableName(path);

    try {
      const { parent, lastKey } = this.findParentVariableFor(splittedPath);
      parent[lastKey] = value;
    } catch (error) {
      this.logger.error(error);
      throw new InvalidSetInstructionError('Invalid set instruction', {
        variable: path,
        value,
      });
    }
  }

  delete(path: string) {
    const splittedPath = parseVariableName(path);

    const { parent, lastKey } = this.findParentVariableFor(splittedPath);
    delete parent[lastKey];
  }

  get publicContexts(): PublicContexts {
    const { run: _, local, ...publicContexts } = this.contexts;
    return {
      ...publicContexts,
      ...local,
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
