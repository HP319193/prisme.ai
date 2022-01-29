import { NextFunction, Request, Response } from "express";
import { AccessManager, SubjectType } from "../../permissions";

export function accessManagerMiddleware(accessManager: AccessManager) {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.accessManager = accessManager.as({
      id: req.context.userId,
    });
    if (req.context.workspaceId) {
      await req.accessManager.pullRoleFromSubject(
        SubjectType.Workspace,
        req.context.workspaceId
      );
    }
    next();
  };
}
