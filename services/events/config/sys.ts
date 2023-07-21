export const HEAPDUMPS_DIRECTORY =
  process.env.HEAPDUMPS_DIRECTORY || './heapdumps';

export const DEBUG = ['dev', 'development'].includes(
  process.env.NODE_ENV || 'production'
);

export const INTERNAL_API_KEY =
  process.env.INTERNAL_API_KEY || '#pZFT>2.g9x8p9D';
