export const MAXIMUM_SUCCESSIVE_CALLS = parseInt(
  process.env.MAXIMUM_SUCCESSIVE_CALLS || '20'
);

export const CONTEXT_RUN_EXPIRE_TIME = parseInt(
  process.env.CONTEXT_RUN_EXPIRE_TIME || '60'
);

export const CONTEXT_UNAUTHENTICATED_SESSION_EXPIRE_TIME = parseInt(
  process.env.CONTEXT_UNAUTHENTICATED_SESSION_EXPIRE_TIME || `${60 * 60}`
);

export const RUNTIME_EMITS_BROKER_TOPIC =
  process.env.RUNTIME_EMITS_BROKER_TOPIC || 'topic:runtime:emit';

export const WAIT_DEFAULT_TIMEOUT = parseInt(
  process.env.WAIT_DEFAULT_TIMEOUT || `20`
);

const ADDITIONAL_GLOBAL_VARS_PREFIX = 'ADDITIONAL_GLOBAL_VARS_';
export const ADDITIONAL_GLOBAL_VARS: Record<string, string> = Object.entries(
  process.env
)
  .filter(([key]) => key.startsWith(ADDITIONAL_GLOBAL_VARS_PREFIX))
  .reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key.slice(ADDITIONAL_GLOBAL_VARS_PREFIX.length)]: value,
    }),
    {}
  );

export const PUBLIC_API_URL =
  process.env.PUBLIC_API_URL ||
  ADDITIONAL_GLOBAL_VARS['apiUrl'] ||
  'http://localhost:3001/v2';

export const FETCH_USER_AGENT_HEADER =
  process.env.FETCH_USER_AGENT_HEADER || 'Prisme.ai Workspaces';

export const SYNCHRONIZE_CONTEXTS = [
  'run',
  'config',
  'session',
  'user',
  'global',
];
