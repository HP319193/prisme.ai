import { NextFunction, Request, Response } from "express";
import { syscfg } from "../config";
import { logger } from "../logger";
import { v4 as uuid } from "uuid";

export interface HTTPContext {
  hostname: string;
  originalUrl: string;
  method: string;
  ip: string;
  path: string;
}

export interface PrismeContext {
  app?: string;
  correlationId: string;
  userId: string;
  workspaceId?: string;
  http?: HTTPContext;
}

export function requestDecorator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const workspaceIdPattern = /^\/v2\/workspaces\/([\w-]+)/;
  const workspaceId = req.path.match(workspaceIdPattern)?.[1];

  const context: PrismeContext = {
    correlationId: (req.header(syscfg.CORRELATION_ID_HEADER) ||
      uuid()) as string,
    userId: req.header(syscfg.USER_ID_HEADER) as any as string,
    workspaceId: workspaceId,
    http: {
      originalUrl: req.originalUrl,
      method: req.method,
      ip:
        <string>req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        req.ip,
      path: req.path,
      hostname: req.hostname,
    },
  };

  req.context = context;
  req.logger = logger.child(context);

  res.set(syscfg.CORRELATION_ID_HEADER, context.correlationId);

  next();
}
