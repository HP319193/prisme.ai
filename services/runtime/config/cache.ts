import { CacheOptions, CacheType } from "../src/cache";

export const CONTEXTS_CACHE: CacheOptions = {
  type: process.env.CONTEXTS_CACHE_TYPE || CacheType.Redis,
  host: process.env.CONTEXTS_CACHE_HOST || "redis://localhost:6379/0",
  password: process.env.CONTEXTS_CACHE_PASSWORD,
};
