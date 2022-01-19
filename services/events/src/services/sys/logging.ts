import { Logger, LogLevel, logger as rootLogger } from "../../logger";

export const changeLogLevel = (logger: Logger) => async (level: LogLevel) => {
  logger.info(`Changed logging level to ${level}`);
  rootLogger.level = level;
};
