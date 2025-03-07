import path from 'path';
import { API_URL } from './api';

export const JWKS_FILEPATH =
  process.env.NODE_ENV !== 'test' &&
  (process.env.JWKS_FILEPATH || path.resolve('../../jwks.json'));

export const OIDC_PROVIDER_URL =
  process.env.OIDC_PROVIDER_URL || API_URL.replace('/v2', '');

// Permissions
export const FIRST_CUSTOM_RULE_PRIORITY = 100;
// last priority must be lower than platform-level priority rules as used in permissions/config.ts
export const LAST_CUSTOM_RULE_PRIORITY = 999;

export const WORKSPACE_SECRET_SYSTEM_PREFIX = 'prismeai_';
