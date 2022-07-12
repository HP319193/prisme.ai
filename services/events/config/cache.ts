import { CacheOptions, CacheType } from '../src/cache';
import { BROKER_HOST, BROKER_PASSWORD } from './eda';

export const EVENTS_TOPICS_CACHE: CacheOptions = {
  type: process.env.EVENTS_TOPICS_CACHE_TYPE || CacheType.Redis,
  host:
    process.env.EVENTS_TOPICS_CACHE_HOST ||
    BROKER_HOST ||
    'redis://localhost:6379/0',
  password: process.env.EVENTS_TOPICS_CACHE_PASSWORD || BROKER_PASSWORD,
};
