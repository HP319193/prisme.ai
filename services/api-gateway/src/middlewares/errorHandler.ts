import express from "express";
import { logger } from "../logger";
import { errors } from "../types";

export default function (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (err) {
    if (err instanceof errors.PrismeError) {
      res.status(err.httpCode).send({
        error: err.error,
        message: err.message,
        success: false,
      });
    } else {
      res.status(500).send({
        error: "Internal",
        message: "Internal server error",
        success: false,
      });
      logger.error({ ...req.context, err });
    }
  } else {
    next();
  }
}
