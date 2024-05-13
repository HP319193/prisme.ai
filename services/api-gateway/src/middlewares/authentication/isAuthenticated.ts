import { NextFunction, Request, Response } from 'express';
import { syscfg } from '../../config';
import { AuthenticationError, MissingMFA } from '../../types/errors';
import { Role } from '../../types/permissions';

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    throw new AuthenticationError(req.authError || 'Unauthenticated');
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

  if (isSuperAdmin(req)) {
    return next();
  }

  throw new AuthenticationError();
}

export function isSuperAdmin(req: Request) {
  const role = req.headers[syscfg.ROLE_HEADER];
  return role === Role.SuperAdmin;
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

export function forbidAccessTokens(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { session } = req;
  if (
    typeof session.prismeaiSessionId === 'string' &&
    session.prismeaiSessionId.startsWith('at:')
  ) {
    throw new AuthenticationError(
      'Calling this API with an access token is forbidden.'
    );
  }
  next();
}
