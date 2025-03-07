import express from 'express';
import { logger } from '../logger';
import { errors } from '../types';
import { PayloadTooLarge } from '../types/errors';

export default function (
  err: Error,
  req: express.Request,
  res: express.Response,
  next?: express.NextFunction
) {
  // Fix occasional "res.status is not a function" errors
  if (typeof res?.status !== 'function') {
    logger.error({
      ...req.context,
      msg: 'Cannot send error through HTTP res as res.status is not a function',
      err,
    });
    return;
  }

  if (err) {
    if (((<any>err)?.message || '').includes('request entity too large')) {
      err = new PayloadTooLarge((<any>err).length, (<any>err).limit);
    }

    if (
      err instanceof errors.PrismeError ||
      (err?.constructor &&
        Object.getPrototypeOf(err?.constructor)?.name === 'PrismeError')
    ) {
      res
        .status((<errors.PrismeError>err).httpCode || 400)
        .send(errors.PrismeError.prototype.toJSON.apply(err));
    } else {
      res.status(500).send({
        error: 'Internal',
        message: 'Internal server error',
        success: false,
      });
      logger.error({ ...req.context, err });
    }
  } else if (next) {
    next();
  }
}
