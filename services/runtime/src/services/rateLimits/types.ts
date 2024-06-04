export interface RateLimits {
  burstRate: number;
  rate: number;
  interval?: 'second' | 'minute' | 'hour';
}

export enum ThrottleType {
  Automations = 'automations',
  Emits = 'emits',
  Fetchs = 'fetchs',
  Repeats = 'repeats',
}

export type WorkspaceLimits = {
  [t in ThrottleType]: RateLimits;
};
