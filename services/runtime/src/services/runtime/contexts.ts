import {
  CONTEXT_RUN_EXPIRE_TIME,
  MAXIMUM_SUCCESSIVE_CALLS,
} from "../../../config";
import { CacheDriver } from "../../cache";
import { TooManyCallError } from "../../errors";

// This contexts holds internal information about current run
// and expires with last executed instruction
// A run can span over multiple events & workflows in a row, all bound to the same correlationId
export interface RunContext {
  depth: number; // Depth of current workflow.
  correlationId: string;
  payload: object;
}

export interface GlobalContext {
  workspaceId: string;
  [k: string]: any;
}

export interface UserContext {
  id: string;
  [k: string]: any;
}

export interface Contexts {
  run: RunContext;
  global: GlobalContext;
  user: UserContext;
  [k: string]: object;
}

export enum ContextType {
  Run = "run",
  Global = "global",
  User = "user",
  Customs = "customs",
}

export class ContextsManager {
  private workspaceId: string;
  private userId: string;
  private correlationId: string;
  private cache: CacheDriver;
  private contexts: Contexts;

  constructor(
    workspaceId: string,
    userId: string,
    correlationId: string,
    cache: CacheDriver
  ) {
    this.workspaceId = workspaceId;
    this.userId = userId;
    this.correlationId = correlationId;
    this.cache = cache;
    this.contexts = this.default();
  }

  private default(additionalContexts: Partial<Contexts> = {}) {
    return {
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
    };
  }

  async fetch() {
    const global = await this.cache.getObject<GlobalContext>(
      this.cacheKey(ContextType.Global)
    );
    const run = await this.cache.getObject<RunContext>(
      this.cacheKey(ContextType.Run)
    );
    const user = await this.cache.getObject<UserContext>(
      this.cacheKey(ContextType.User)
    );
    const customs = await this.cache.getObject(
      this.cacheKey(ContextType.Customs)
    );

    this.contexts = this.default({
      ...(customs || {}),
      global,
      run,
      user,
    });
  }

  async save(context?: ContextType) {
    const { global, run, user, ...customs } = this.contexts;

    if (!context || context === ContextType.Global) {
      await this.cache.setObject(this.cacheKey(ContextType.Global), global);
    }
    if (!context || context === ContextType.Run) {
      await this.cache.setObject(this.cacheKey(ContextType.Run), run, {
        ttl: CONTEXT_RUN_EXPIRE_TIME,
      });
    }
    if (!context || context === ContextType.User) {
      await this.cache.setObject(this.cacheKey(ContextType.User), user);
    }
    if (!context || context === ContextType.Customs) {
      await this.cache.setObject(this.cacheKey(ContextType.Customs), customs);
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

  get<T = object>(context: ContextType | string) {
    if (context in ContextType) {
      return this.contexts[context];
    }
    return this.contexts[ContextType.Customs] as any as T;
  }

  async securityChecks() {
    if (this.run.depth > MAXIMUM_SUCCESSIVE_CALLS) {
      throw new TooManyCallError("Reached maximum number of successive calls", {
        limit: MAXIMUM_SUCCESSIVE_CALLS,
      });
    }
    // TODO check memory usage
    this.run.depth++;

    await this.save(ContextType.Run);
  }
}
