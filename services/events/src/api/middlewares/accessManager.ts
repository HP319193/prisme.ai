import { NextFunction, Request, Response } from 'express';
import { API_KEY_HEADER } from '../../../config';
import { AccessManager, SubjectType } from '../../permissions';

export function accessManagerMiddleware(accessManager: AccessManager) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers[API_KEY_HEADER];

    try {
      req.accessManager = await accessManager.as(
        {
          id: req.context.userId,
        },
        apiKey as string
      );
    } catch (error) {
      next(error);
      return;
    }

    if (req.context.workspaceId && req.accessManager) {
      await req.accessManager.pullRoleFromSubject(
        SubjectType.Workspace,
        req.context.workspaceId
      );
    }
    next();
  };
}
