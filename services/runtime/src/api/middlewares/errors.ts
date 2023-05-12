'use strict';

import { NextFunction, Request, Response } from 'express';
import { PrismeContext } from '.';
import { EventType } from '../../eda';
import { ErrorSeverity, ObjectNotFoundError, PrismeError } from '../../errors';
import { logger } from '../../logger';

enum KnownErrorCodes {
  ObjectNotFound = 'ObjectNotFoundError',
  ForbiddenError = 'ForbiddenError',
  BrokerError = 'BrokerError',
  InvalidAPIKey = 'InvalidAPIKey',
  PrismeError = 'PrismeError',
}

function errorHttpStatus(err: Error, serverError: boolean) {
  if (
    (<any>err)?.details?.[0]?.message === 'not found' ||
    err instanceof ObjectNotFoundError ||
    (err as any).error == KnownErrorCodes.ObjectNotFound
  ) {
    return 404;
  }
  if ((err as any).error == KnownErrorCodes.ForbiddenError) {
    return 403;
  }
  if (((<any>err)?.message || '').includes('request entity too large')) {
    return 413;
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
  const isKnownErrorCode =
    Object.values(KnownErrorCodes).includes(
      (err as PrismeError).error as KnownErrorCodes
    ) ||
    (err.stack || '').includes('PrismeError') ||
    (err?.constructor &&
      Object.getPrototypeOf(err?.constructor)?.name === 'PrismeError');
  // Server error and stack trace is available - it is most likely a developer error
  const serverError =
    !isKnownErrorCode &&
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
    error: PrismeError.prototype.toJSON.apply(err),
    httpStatus: errorHttpStatus(err, serverError),
  });
};

// eslint-disable-next-line consistent-return
export const finalErrorHandler = (
  err: DecoratedError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) return next(err);
  return res
    .status(err.httpStatus || 500)
    .json(err.error || { error: 'Internal error' });
};

module.exports = {
  errorDecorator,
  finalErrorHandler,
};
