import path from 'path';

const DEBUG = ['dev', 'development'].includes(process.env.NODE_ENV || '');

const API_KEY_HEADER = process.env.API_KEY_HEADER || 'x-prismeai-api-key';
const SOURCE_WORKSPACE_ID_HEADER = 'x-prismeai-workspace-id';
const CSRF_TOKEN_HEADER =
  process.env.CSRF_TOKEN_HEADER || 'x-prismeai-csrf-token';

export default {
  PORT: process.env.PORT || 3001,
  API_URL: process.env.API_URL || 'http://studio.local.prisme.ai:3001/v2',

  DEBUG,

  GATEWAY_CONFIG:
    process.env.GATEWAY_CONFIG_PATH ||
    path.join(__dirname, '../../gateway.config.yml'),

  AUTH_PROVIDERS_CONFIG:
    process.env.AUTH_PROVIDERS_CONFIG_PATH ||
    path.join(__dirname, '../../authProviders.config.yml'),

  OPENAPI_FILEPATH:
    process.env.OPENAPI_FILEPATH ||
    path.resolve(__dirname, '../../specifications/swagger.yml'),

  CORRELATION_ID_HEADER:
    process.env.CORRELATION_ID_HEADER || 'x-correlation-id',
  USER_ID_HEADER: process.env.USER_ID_HEADER || 'x-prismeai-user-id',
  OVERWRITE_CORRELATION_ID_HEADER:
    typeof process.env.OVERWRITE_CORRELATION_ID_HEADER !== 'undefined'
      ? process.env.OVERWRITE_CORRELATION_ID_HEADER != 'no'
      : !DEBUG,

  SESSION_ID_HEADER: process.env.SESSION_ID_HEADER || 'x-prismeai-session-id',

  AUTH_DATA_HEADER: process.env.AUTH_DATA_HEADER || 'x-prismeai-auth-data',

  API_KEY_HEADER,
  SOURCE_WORKSPACE_ID_HEADER,

  CSRF_TOKEN_HEADER,

  ALLOWED_PRISMEAI_HEADERS_FROM_OUTSIDE: [API_KEY_HEADER, CSRF_TOKEN_HEADER],

  ROLE_HEADER: process.env.ROLE_HEADER || 'x-prismeai-role',

  SUPER_ADMIN_EMAILS: process.env.SUPER_ADMIN_EMAILS || '',

  LEGACY_SESSION_HEADER: 'x-prismeai-token', // Legacy

  OIDC_CLIENT_ID_HEADER:
    process.env.OIDC_CLIENT_ID_HEADER || 'x-prismeai-client-id',

  SESSION_COOKIES_MAX_AGE: parseInt(
    process.env.SESSION_COOKIES_MAX_AGE || <any>(30 * 24 * 60 * 60)
  ), // 1 month (seconds)

  SESSION_COOKIES_SIGN_SECRET:
    process.env.SESSION_COOKIES_SIGN_SECRET || ',s6<Mt3=dE[7a#k{)4H)C4%',

  // required by external SSO which redirects towards api & needs connect.sid to be set during this redirection
  EXPRESS_SESSION_COOKIE_SAMESITE:
    (process.env.EXPRESS_SESSION_COOKIE_SAMESITE as
      | 'none'
      | 'lax'
      | 'strict') || (DEBUG ? '' : 'none'),

  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || '#pZFT>2.g9x8p9D',

  PASSWORD_VALIDATION_REGEXP: new RegExp(
    process.env.PASSWORD_VALIDATION_REGEXP || '^.{8,32}$'
  ),

  X_FORWARDED_HEADERS: ['yes', 'enabled', 'enable', 'true'].includes(
    process.env.X_FORWARDED_HEADERS || 'yes'
  ),

  // This is only applied to gateway one apis
  REQUEST_MAX_SIZE: process.env.REQUEST_MAX_SIZE || '1mb',

  // This is the limit applied to all forwarded request sizes
  // Since we can't distinguish regular requests from upload ones yet
  UPLOADS_MAX_SIZE: parseInt(
    process.env.UPLOADS_MAX_SIZE || '10000000' // 10MB
  ),

  ENABLE_HEALTHCHECK_LOGS: ['yes', 'enabled', 'enable', 'true'].includes(
    (process.env.ENABLE_HEALTHCHECK_LOGS || 'no').toLowerCase()
  ),
};
