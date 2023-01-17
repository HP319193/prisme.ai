import { NextFunction, Request, Response } from 'express';
import { syscfg } from '../../config';
import { AuthenticationError, MissingMFA } from '../../types/errors';

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    throw new AuthenticationError();
  }

  return next();
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

export function enforceMFA(req: Request, res: Response, next: NextFunction) {
  const { user, session } = req;
  if (!user) {
    throw new AuthenticationError();
  }
  if (user.mfa && user.mfa !== 'none' && !session.mfaValidated) {
    throw new MissingMFA();
  }
  next();
}
