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
