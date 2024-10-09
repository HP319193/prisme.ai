import { StorageDriverType, StorageOptions } from '../storage';
import { extractOptsFromEnv } from '../utils';

const SESSIONS_CACHE_HOST =
  process.env.SESSIONS_STORAGE_HOST || 'redis://localhost:6379/0';

export default <Record<string, StorageOptions>>{
  // Persists users + OAuth clients + OTPKeys + AccessTokens
  Users: {
    driver: process.env.USERS_STORAGE_TYPE || StorageDriverType.Mongodb,
    host: process.env.USERS_STORAGE_HOST || 'mongodb://localhost:27017/users',
    driverOptions: extractOptsFromEnv('USERS_STORAGE_OPT_'),
  },

  // Persists session JWTs signing keys
  JWKS: {
    driver:
      process.env.JWKS_STORAGE_TYPE ||
      process.env.USERS_STORAGE_TYPE ||
      StorageDriverType.Mongodb,
    host:
      process.env.JWKS_STORAGE_HOST ||
      process.env.USERS_STORAGE_HOST ||
      'mongodb://localhost:27017/users',
    driverOptions: process.env.JWKS_STORAGE_HOST
      ? extractOptsFromEnv('JWKS_STORAGE_OPT_')
      : extractOptsFromEnv('USERS_STORAGE_OPT_'),
  },

  // Cache OIDC authentication states (not authenticated user/sessions/tokens, but current state of their authentication flow) + express-session
  Sessions: {
    driver: 'redis',
    host: SESSIONS_CACHE_HOST,
    password: process.env.SESSIONS_STORAGE_PASSWORD,
    driverOptions: extractOptsFromEnv('SESSIONS_STORAGE_OPT_'),
  },

  // RBAC permissions
  Permissions: {
    driver: 'mongodb',
    host:
      process.env.PERMISSIONS_STORAGE_HOST ||
      'mongodb://localhost:27017/permissions',
    driverOptions: extractOptsFromEnv('PERMISSIONS_STORAGE_OPT_'),
  },

  RateLimits: {
    driver: 'redis',
    host: process.env.RATE_LIMITS_STORAGE_HOST || SESSIONS_CACHE_HOST,
    password:
      process.env.RATE_LIMITS_STORAGE_PASSWORD ||
      process.env.SESSIONS_STORAGE_PASSWORD,
    driverOptions: extractOptsFromEnv('RATE_LIMITS_STORAGE_OPT_'),
  },
};
