import pino from 'pino';
import { DEBUG } from '../../config/sys';
import { APP_NAME } from '../../config/eda';

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
    app: APP_NAME,
  },
  level: process.env.LOG_LEVEL || (DEBUG ? LogLevel.Trace : LogLevel.Info),
});
