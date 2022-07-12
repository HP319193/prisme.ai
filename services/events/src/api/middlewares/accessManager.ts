import { NextFunction, Request, Response } from 'express';
import { API_KEY_HEADER } from '../../../config';
import { Cache } from '../../cache';
import { AccessManager } from '../../permissions';
import { getWorkspaceUser } from '../../services/events/users';

export function accessManagerMiddleware(
  accessManager: AccessManager,
  cache: Cache
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers[API_KEY_HEADER];

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
        workspaceUser,
        apiKey as string
      );
    } catch (error) {
      next(error);
      return;
    }

    next();
  };
}
