//@ts-ignore
import RedisCache from './redis';
import { CacheDriver, CacheOptions } from './types';

export * from './types';

export enum CacheType {
  Redis = 'redis',
}

export function buildCache(opts: CacheOptions): CacheDriver {
  switch (opts.driver) {
    case CacheType.Redis:
      const cache = new RedisCache(opts);
      cache.connect();
      return cache;
    default:
      throw new Error(`Cache driver '${opts.driver}' does not exist.`);
  }
}
