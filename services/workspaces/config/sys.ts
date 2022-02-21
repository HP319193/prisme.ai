export const HEAPDUMPS_DIRECTORY =
  process.env.HEAPDUMPS_DIRECTORY || './heapdumps';

export const DEBUG = ['dev', 'development'].includes(
  process.env.NODE_ENV || 'production'
);
