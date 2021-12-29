"use strict";

import { NextFunction, Request, Response } from "express";
import { PrismeContext } from ".";
import { EventType } from "../../eda";
import { ErrorSeverity, PrismeError } from "../../errors";
import { logger } from "../../logger";

function errorHttpStatus(err: Error, serverError: boolean) {
  // Handles express-openapi-validator not found error
  if ((<any>err)?.details?.[0]?.message === "not found") {
    return 404;
  }
  return serverError ? 500 : 400;
}

export interface DecoratedError {
  context: PrismeContext;
  error: object;
  httpStatus: number;
}

/**
 * Custom error handler middleware
 * Decorate error object with additional data
 * WARNING: Must be defined last, after other app.use() and routes calls
 */
export const errorDecorator = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Server error and stack trace is available - it is most likely a developer error
  const serverError =
    (err as PrismeError).error !== "BrokerError" &&
    (!(err instanceof PrismeError) ||
      (err as PrismeError).severity === ErrorSeverity.Fatal);

  if (serverError) {
    (req.logger || logger).fatal({ ...req.context, err });
  } else {
    (req.logger || logger).error({ ...req.context, err });
  }

  if (req.broker) {
    req.broker.send(EventType.Error, err);
  }

  next({
    error:
      err instanceof PrismeError || (err as PrismeError).error === "BrokerError"
        ? PrismeError.prototype.toJSON.apply(err)
        : err,
    httpStatus: errorHttpStatus(err, serverError),
  });
};

/**
 * Custom error handling middleware - final
 * WARNING: Must be defined last, after other app.use(), routes calls
 * and all other error handling middleware
 */
// eslint-disable-next-line consistent-return
export const finalErrorHandler = (
  err: DecoratedError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /**
   * Delegate to the default Express error handler,
   * when the headers have already been sent to the client
   */
  if (res.headersSent) return next(err);

  /**
   * Crash server in case of a developer error.
   * NOTE: a Node.js process manager should be set up to immediately restart the crashed server
   */
  // if (err.isDeveloperError) exitProcess();
  // else
  return res.status(err.httpStatus || 500).json(err.error || "Internal error");
};

module.exports = {
  errorDecorator,
  finalErrorHandler,
};
