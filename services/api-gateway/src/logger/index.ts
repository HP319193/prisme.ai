import pino from 'pino';

export type Logger = pino.Logger;

export enum LogLevel {
  Fatal = 'fatal',
  Error = 'error',
  Warning = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
}

export const logger = pino({
  base: {
    app: 'prisme.ai-api-gateway',
  },
});
