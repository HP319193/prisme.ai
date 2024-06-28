import { TokenBucket } from 'limiter';
import { logger } from '../../logger';
import { ContextsManager } from '../runtime/contexts';
import { ThrottleType, WorkspaceLimits } from './types';
import {
  RATE_LIMIT_AUTOMATIONS,
  RATE_LIMIT_EMITS,
  RATE_LIMIT_FETCHS,
  RATE_LIMIT_REPEATS,
  RATE_LIMIT_DISABLED,
} from '../../../config/rateLimits';

export class RateLimiter {
  private workspaces: Record<string, WorkspaceLimiter>;

  constructor() {
    this.workspaces = {};
  }

  initWorkspaceLimits(workspaceId: string) {
    this.workspaces[workspaceId] = new WorkspaceLimiter(workspaceId, {
      automations: RATE_LIMIT_AUTOMATIONS,
      emits: RATE_LIMIT_EMITS,
      fetchs: RATE_LIMIT_FETCHS,
      repeats: RATE_LIMIT_REPEATS,
    });

    return this.workspaces[workspaceId];
  }

  workspace(workspaceId: string) {
    if (!this.workspaces[workspaceId]) {
      return this.initWorkspaceLimits(workspaceId);
    }
    return this.workspaces[workspaceId];
  }
}

class WorkspaceLimiter {
  private limits: WorkspaceLimits;

  private workspaceId: string;
  private automations: TokenBucket;
  private emits: TokenBucket;
  private fetchs: TokenBucket;
  private repeats: TokenBucket;

  constructor(workspaceId: string, limits: WorkspaceLimits) {
    this.workspaceId = workspaceId;
    this.limits = limits;

    const { automations, emits, fetchs, repeats } = limits;

    this.automations = new TokenBucket({
      bucketSize: automations.burstRate,
      tokensPerInterval: automations.rate,
      interval: automations.interval || 'second',
    });
    this.automations.content = automations.burstRate;

    this.emits = new TokenBucket({
      bucketSize: emits.burstRate,
      tokensPerInterval: emits.rate,
      interval: emits.interval || 'second',
    });
    this.emits.content = emits.burstRate;

    this.fetchs = new TokenBucket({
      bucketSize: fetchs.burstRate,
      tokensPerInterval: fetchs.rate,
      interval: fetchs.interval || 'second',
    });
    this.fetchs.content = fetchs.burstRate;

    this.repeats = new TokenBucket({
      bucketSize: repeats.burstRate,
      tokensPerInterval: repeats.rate,
      interval: repeats.interval || 'second',
    });
    this.repeats.content = repeats.burstRate;
  }

  private tokenBucket(type: ThrottleType) {
    if (type === ThrottleType.Automations) {
      return this.automations;
    }
    if (type === ThrottleType.Emits) {
      return this.emits;
    }
    if (type === ThrottleType.Fetchs) {
      return this.fetchs;
    }
    if (type === ThrottleType.Repeats) {
      return this.repeats;
    }
    return this.automations;
  }

  private async throttle(
    type: ThrottleType,
    ctx: ContextsManager,
    tokens: number = 1
  ) {
    if (RATE_LIMIT_DISABLED) {
      return Number.POSITIVE_INFINITY;
    }
    let t0 = Date.now();
    const ret = await this.tokenBucket(type).removeTokens(tokens);
    const throttled = Date.now() - t0;
    if (throttled > 10) {
      logger.info({
        msg: `Workspace ${this.workspaceId} throttled ${type} execution of ${throttled} ms`,
        correlationId: ctx.correlationId,
        throttleType: type,
        rateLimit: this.limits?.[type]?.rate,
        workspaceId: this.workspaceId,
      });
    }

    if (throttled > 1) {
      ctx.throttled = (ctx.throttled || 0) + throttled;
    }

    return ret;
  }

  public executeAutomation(ctx: ContextsManager) {
    return this.throttle(ThrottleType.Automations, ctx);
  }

  public emit(ctx: ContextsManager) {
    return this.throttle(ThrottleType.Emits, ctx);
  }

  public fetch(ctx: ContextsManager) {
    return this.throttle(ThrottleType.Fetchs, ctx);
  }

  public repeat(ctx: ContextsManager, iterations: number) {
    return this.throttle(ThrottleType.Repeats, ctx, iterations);
  }
}

const rateLimiter = new RateLimiter();
export { rateLimiter };
