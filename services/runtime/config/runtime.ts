export const MAXIMUM_SUCCESSIVE_CALLS = parseInt(
  process.env.MAXIMUM_SUCCESSIVE_CALLS || "20"
);

export const CONTEXT_RUN_EXPIRE_TIME = parseInt(
  process.env.CONTEXT_RUN_EXPIRE_TIME || "60"
);

export const CONTEXT_SESSION_EXPIRE_TIME = parseInt(
  process.env.CONTEXT_SESSION_EXPIRE_TIME || `${60 * 15}`
);
