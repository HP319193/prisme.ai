"use strict";

import { logger } from "../logger";

/**
 * The 'unhandledRejection' event is emitted whenever a Promise is rejected and
 * no error handler is attached to the promise.
 *
 * The 'unhandledRejection' event is useful for detecting and keeping track of promises
 * that were rejected whose rejections have not yet been handled.
 *
 * From Node.js v6.6.0: Unhandled Promise rejections emit a process warning. Process does not crash,
 * however in future versions of nodejs process will crash.
 *
 * @link https://nodejs.org/api/process.html#process_event_unhandledrejection
 */
export const unhandledRejectionHandler = (reason: string, p: Promise<any>) => {
  logger.error({ reason, message: "Unhandled Rejection at Promise", p });
};

export const uncaughtExceptionHandler = (err: Error) => {
  logger.error(err);
  // exitProcess();
};
