import RedisCache from "./redis";
import { CacheOptions } from "./types";
export * from "./types";

export enum CacheType {
  Redis = "redis",
}

export async function buildCache(opts: CacheOptions) {
  switch (opts.type) {
    case CacheType.Redis:
      const redis = new RedisCache(opts);
      await redis.connect();
      return redis;
    default:
      throw new Error(`Cache driver '${opts.type}' does not exist.`);
  }
}
