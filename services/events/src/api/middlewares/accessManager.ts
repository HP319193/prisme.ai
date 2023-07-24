import { NextFunction, Request, Response } from 'express';
import { API_KEY_HEADER, INTERNAL_API_KEY, ROLE_HEADER } from '../../../config';
import { Cache } from '../../cache';
import { AccessManager } from '../../permissions';
import { getWorkspaceUser } from '../../services/events/users';
import { ForbiddenError } from '@prisme.ai/permissions';

export function accessManagerMiddleware(
  accessManager: AccessManager,
  cache: Cache
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers[API_KEY_HEADER];
    const role = req.headers[ROLE_HEADER];

    try {
      const workspaceUser = await getWorkspaceUser(
        req.context.workspaceId!,
        {
          id: req.context.userId,
          sessionId: req.context.sessionId,
        },
        cache
      );
      req.accessManager = await accessManager.as(
        { ...workspaceUser, role: role as Prismeai.Role },
        apiKey as string
      );
    } catch (error) {
      next(error);
      return;
    }

    next();
  };
}

export function isInternallyAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = API_KEY_HEADER && req.headers[API_KEY_HEADER];
  if (apiKey && apiKey === INTERNAL_API_KEY) {
    return next();
  }

  throw new ForbiddenError('Forbidden');
}
