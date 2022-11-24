import path from 'path';

export const PORT = process.env.PORT || 3002;

export const CORRELATION_ID_HEADER =
  process.env.CORRELATION_ID_HEADER || 'x-correlation-id';

export const USER_ID_HEADER =
  process.env.USER_ID_HEADER || 'x-prismeai-user-id';

export const SESSION_ID_HEADER =
  process.env.SESSION_ID_HEADER || 'x-prismeai-session-id';

export const API_KEY_HEADER =
  process.env.API_KEY_HEADER || 'x-prismeai-api-key';

export const ROLE_HEADER = process.env.ROLE_HEADER || 'x-prismeai-role';

export const OPENAPI_FILEPATH =
  process.env.OPENAPI_FILEPATH ||
  path.resolve(__dirname, '../specifications/swagger.yml');
