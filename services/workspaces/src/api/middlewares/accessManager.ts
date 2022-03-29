import { NextFunction, Request, Response } from 'express';
import { AccessManager } from '../../permissions';

export function accessManagerMiddleware(accessManager: AccessManager) {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.accessManager = await accessManager.as({
      id: req.context.userId,
    });
    next();
  };
}
