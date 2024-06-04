import { RateLimits } from '../src/services/rateLimits/types';

export const RATE_LIMIT_AUTOMATIONS: RateLimits = {
  rate: parseInt(process.env.RATE_LIMIT_AUTOMATIONS || '100'),
  burstRate: parseInt(process.env.RATE_LIMIT_AUTOMATIONS_BURST || '400'),
};

export const RATE_LIMIT_EMITS: RateLimits = {
  rate: parseInt(process.env.RATE_LIMIT_EMITS || '30'),
  burstRate: parseInt(process.env.RATE_LIMIT_EMITS_BURST || '100'),
};

export const RATE_LIMIT_FETCHS: RateLimits = {
  rate: parseInt(process.env.RATE_LIMIT_FETCHS || '50'),
  burstRate: parseInt(process.env.RATE_LIMIT_FETCHS_BURST || '200'),
};

export const RATE_LIMIT_REPEATS: RateLimits = {
  rate: parseInt(process.env.RATE_LIMIT_REPEATS || '1000'),
  burstRate: parseInt(process.env.RATE_LIMIT_REPEATS_BURST || '4000'),
};
