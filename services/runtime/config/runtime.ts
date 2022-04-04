export const MAXIMUM_SUCCESSIVE_CALLS = parseInt(
  process.env.MAXIMUM_SUCCESSIVE_CALLS || '4'
);

export const CONTEXT_RUN_EXPIRE_TIME = parseInt(
  process.env.CONTEXT_RUN_EXPIRE_TIME || '60'
);

export const CONTEXT_SESSION_EXPIRE_TIME = parseInt(
  process.env.CONTEXT_SESSION_EXPIRE_TIME || `${60 * 15}`
);

export const RUNTIME_EMITS_BROKER_TOPIC =
  process.env.RUNTIME_EMITS_BROKER_TOPIC || 'topic:runtime:emit';

export const WAIT_DEFAULT_TIMEOUT = parseInt(
  process.env.WAIT_DEFAULT_TIMEOUT || `20`
);
