import { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../../types/errors";

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user) {
    return next();
  }

  throw new AuthenticationError();
}
