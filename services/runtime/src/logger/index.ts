import pino from "pino";
import { APP_NAME, DEBUG } from "../../config";

export type Logger = pino.Logger;

export enum LogLevel {
  Fatal = "fatal",
  Error = "error",
  Warning = "warn",
  Info = "info",
  Debug = "debug",
  Trace = "trace",
}

export const logger = pino({
  base: {
    app: APP_NAME,
  },
  level: DEBUG ? LogLevel.Trace : LogLevel.Info,
});
