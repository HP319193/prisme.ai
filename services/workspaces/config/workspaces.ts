// Must be in sync with EVENT_NAMES_REGEXP variable inside Broker eventsFactory.ts
// TODO move to a shared utils package
export const SLUG_VALIDATION_REGEXP = new RegExp(
  process.env.SLUG_VALIDATION_REGEXP || '^[a-zA-Z0-9 _-]*$'
);

export const MAXIMUM_WORKSPACE_VERSION = parseInt(
  process.env.MAXIMUM_WORKSPACE_VERSION || '20'
);

export const MAXIMUM_APP_VERSION = parseInt(
  process.env.MAXIMUM_APP_VERSION || '1000'
);
