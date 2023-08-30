import { DriverType } from '../src/services/schedules/drivers/types';
import { CONTEXTS_CACHE } from './cache';

// Schedules can have their own redis instance
// However it will use the same instance as the cache one if not specified
export const SCHEDULES = {
  type: process.env.SCHEDULES_DRIVER_TYPE || DriverType.BullMQ,
  host:
    process.env.SCHEDULES_DRIVER_HOST ||
    CONTEXTS_CACHE.host ||
    'redis://localhost:6379/12',
  password: process.env.SCHEDULES_DRIVER_PASSWORD || CONTEXTS_CACHE.password,
  maxOccurrencePattern:
    process.env.SCHEDULES_MAXIMUM_OCCURRENCE_PATTERN || '*/15 * * * *',
  removeOnComplete: {
    age: parseInt(
      process.env.SCHEDULES_COMPLETED_JOBS_REDIS_MAX_AGE || `${3600 * 24 * 7}`
    ),
  },
  removeOnFail: {
    age: parseInt(
      process.env.SCHEDULES_COMPLETED_JOBS_REDIS_MAX_AGE || `${3600 * 24 * 7}`
    ),
  },
};
