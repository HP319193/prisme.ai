import { Logger, LogLevel } from "../../logger";

export const changeLogLevel = (logger: Logger) => async (level: LogLevel) => {
  logger.info(`Changed logging level to ${level}`);
  logger.level = level;
};
