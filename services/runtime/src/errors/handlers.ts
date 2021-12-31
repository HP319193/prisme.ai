"use strict";

import { logger } from "../logger";

export const uncaughtExceptionHandler = (err: Error) => {
  logger.error(err);
  // exitProcess();
};
