import { OPENAPI_FILEPATH } from './api';

export const APP_NAME = process.env.APP_NAME || 'prisme.ai-events';

export const EVENTS_OAS_PATH = process.env.EVENTS_OAS_PATH || OPENAPI_FILEPATH;

// export const EVENTS_OAS_URL =
//   process.env.EVENTS_OAS_URL ||
//   "https://gitlab.com/prisme.ai/prisme.ai-events/-/raw/main/specifications/swagger.yml";

export const BROKER_DRIVER = process.env.BROKER_DRIVER || 'redis';

export const BROKER_HOST =
  process.env.BROKER_HOST || 'redis://localhost:6379/10';

export const BROKER_PASSWORD = process.env.BROKER_PASSWORD;

export const SOCKETIO_REDIS_HOST =
  process.env.SOCKETIO_REDIS_HOST || BROKER_HOST;

export const SOCKETIO_REDIS_PASSWORD =
  process.env.SOCKETIO_REDIS_PASSWORD || BROKER_PASSWORD;

export const SOCKETIO_COOKIE_MAX_AGE = process.env.SOCKETIO_COOKIE_MAX_AGE
  ? parseInt(process.env.SOCKETIO_COOKIE_MAX_AGE)
  : undefined;

export const BROKER_WHITELIST_EVENT_PREFIXES = (
  process.env.BROKER_WHITELIST_EVENT_PREFIXES || 'apps.'
).split(',');

export const BROKER_NAMESPACE = process.env.BROKER_NAMESPACE;

export const BROKER_TOPIC_MAXLEN = parseInt(
  process.env.BROKER_TOPIC_MAXLEN || '10000'
);

export const RUNTIME_EMITS_BROKER_TOPIC =
  process.env.RUNTIME_EMITS_BROKER_TOPIC || 'topic:runtime:emit';

export const BROKER_EMIT_MAXLEN = parseInt(
  process.env.BROKER_EMIT_MAXLEN || '100000'
);
