import { NextFunction, Request, Response } from 'express';
import { AccessManager, SubjectType } from '../../permissions';

export function accessManagerMiddleware(accessManager: AccessManager) {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.accessManager = await accessManager.as({
      id: req.context.userId,
    });
    if (req.context.workspaceId) {
      try {
        await req.accessManager.pullRoleFromSubject(
          SubjectType.Workspace,
          req.context.workspaceId
        );
      } catch {}
    }
    next();
  };
}
