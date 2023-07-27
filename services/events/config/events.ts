export const EVENTS_BUFFER_FLUSH_AT = parseInt(
  process.env.EVENTS_BUFFER_FLUSH_AT || '128'
);
export const EVENTS_BUFFER_HIGH_WATERMARK = parseInt(
  process.env.EVENTS_BUFFER_HIGH_WATERMARK || '256'
);

export const EVENTS_BUFFER_FLUSH_EVERY = parseInt(
  process.env.EVENTS_BUFFER_FLUSH_EVERY || '5000'
);

export const EVENTS_RETENTION_DAYS = parseInt(
  process.env.EVENTS_RETENTION_DAYS || `${30 * 6}`
);

export const EVENTS_SCHEDULED_DELETION_DAYS = parseInt(
  process.env.EVENTS_SCHEDULED_DELETION_DAYS || `${30 * 3}`
);

export const ELASTIC_SEARCH_TIMEOUT =
  process.env.ELASTIC_SEARCH_TIMEOUT || '2000ms';

export const ELASTIC_SEARCH_FORBIDDEN_AGGS = (
  process.env.ELASTIC_SEARCH_FORBIDDEN_AGGS || 'scripted_metric'
).split(',');

export const ELASTIC_SEARCH_FORBIDDEN_MAX_DEPTH = parseInt(
  process.env.ELASTIC_SEARCH_FORBIDDEN_MAX_DEPTH || '5'
);

export const EVENTS_CLEANUP_WORKSPACE_INACTIVITY_DAYS = parseInt(
  process.env.EVENTS_CLEANUP_WORKSPACE_INACTIVITY_DAYS || '100'
);

export const EVENTS_CLEANUP_WORKSPACE_MAX_EVENTS = parseInt(
  process.env.EVENTS_CLEANUP_WORKSPACE_MAX_EVENTS || '100'
);
