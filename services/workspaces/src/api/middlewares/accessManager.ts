import { NextFunction, Request, Response } from 'express';
import { API_KEY_HEADER, ROLE_HEADER } from '../../../config';
import { AccessManager } from '../../permissions';

export function accessManagerMiddleware(accessManager: AccessManager) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers[API_KEY_HEADER];
    const role = req.headers[ROLE_HEADER];

    try {
      req.accessManager = await accessManager.as(
        {
          id: req.context.userId,
          sessionId: req.context.sessionId,
          role: role as Prismeai.Role,
        },
        apiKey as string
      );
    } catch (error) {
      next(error);
      return;
    }
    next();
  };
}
