import { NextFunction, Request, Response } from 'express';
import { AccessManager } from '../../permissions';

export function accessManagerMiddleware(accessManager: AccessManager) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.accessManager = await accessManager.as({
        id: req.context.userId,
        sessionId: req.context.sessionId,
      });
    } catch (error) {
      next(error);
      return;
    }
    next();
  };
}
