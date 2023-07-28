import path from 'path';
import { ADDITIONAL_GLOBAL_VARS } from './runtime';

export const API_URL =
  process.env.API_URL ||
  process.env.PUBLIC_API_URL ||
  ADDITIONAL_GLOBAL_VARS['apiUrl'] ||
  'http://studio.local.prisme.ai:3001/v2';

export const PORT = process.env.PORT || 3003;

export const CORRELATION_ID_HEADER =
  process.env.CORRELATION_ID_HEADER || 'x-correlation-id';

export const USER_ID_HEADER =
  process.env.USER_ID_HEADER || 'x-prismeai-user-id';

export const SESSION_ID_HEADER =
  process.env.SESSION_ID_HEADER || 'x-prismeai-session-id';

export const OPENAPI_FILEPATH =
  process.env.OPENAPI_FILEPATH ||
  path.resolve(__dirname, '../specifications/swagger.yml');
