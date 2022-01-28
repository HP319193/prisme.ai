import { NextFunction, Request, Response } from "express";
import { AccessManager } from "../../permissions";

export function accessManagerMiddleware(accessManager: AccessManager) {
  return (req: Request, res: Response, next: NextFunction) => {
    req.accessManager = accessManager.as({
      id: req.context.userId,
    });
    next();
  };
}
