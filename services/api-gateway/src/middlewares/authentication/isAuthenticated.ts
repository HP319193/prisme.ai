import { NextFunction, Request, Response } from 'express';
import { syscfg } from '../../config';
import { AuthenticationError } from '../../types/errors';

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
  optional?: boolean
) {
  if (!req.user && !optional) {
    throw new AuthenticationError();
  }

  return next(req.user);
}

export function isInternallyAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers[syscfg.API_KEY_HEADER];
  if (apiKey && apiKey === syscfg.INTERNAL_API_KEY) {
    return next();
  }

  throw new AuthenticationError();
}
