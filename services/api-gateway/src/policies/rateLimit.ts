import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { buildRedis } from '../cache/redis';
import storage from '../config/storage';
import { logger } from '../logger';
import { Request, Response } from 'express';
import { TooManyRequests } from '../types/errors';
import { extractRequestIp } from '../middlewares';

export interface Params {
  window: number;
  key: 'userId' | 'ip' | 'workspaceId' | ((req: Request) => string);
  limit: number;
}

export const validatorSchema = {
  window: 'required|number',
  limit: 'required|number',
  key: 'required|string',
};
const redisClient = buildRedis('rate-limiter', storage.RateLimits);
redisClient.connect().catch((err) => logger.error({ err }));

export async function init(params: Params) {
  const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: params.limit,
    duration: params.window,
    useRedisPackage: true,
  });

  return async (req: Request, res: Response, next: any) => {
    try {
      let key =
        typeof params.key === 'function'
          ? params.key(req)
          : extractRequestIp(req);
      if (params.key === 'userId' && req.user?.id) {
        key = req.user?.id;
      } else if (params.key === 'workspaceId' && req.context?.workspaceId) {
        key = req.context.workspaceId;
      }
      const limits = await rateLimiter.consume(key);
      res.setHeader('Retry-After', limits.msBeforeNext / 1000);
      res.setHeader('X-RateLimit-Limit', params.limit);
      res.setHeader('X-RateLimit-Remaining', limits.remainingPoints);
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + limits.msBeforeNext).toString()
      );
    } catch (res) {
      throw new TooManyRequests((res as RateLimiterRes).msBeforeNext / 1000);
    }

    next();
  };
}
