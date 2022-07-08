import express from 'express';
import { logger } from '../logger';
import { errors } from '../types';
import { PayloadTooLarge } from '../types/errors';

export default function (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (err) {
    if (((<any>err)?.message || '').includes('request entity too large')) {
      err = new PayloadTooLarge((<any>err).length, (<any>err).limit);
    }

    if (
      err instanceof errors.PrismeError ||
      (err.stack || '').includes('PrismeError')
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
  } else {
    next();
  }
}
