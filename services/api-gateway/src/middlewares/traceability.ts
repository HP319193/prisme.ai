import { NextFunction, Request, Response } from 'express';
import { syscfg } from '../config';
import { logger } from '../logger';
import { v4 as uuid } from 'uuid';
import { broker } from '../eda';

export interface HTTPContext {
  hostname: string;
  originalUrl: string;
  method: string;
  ip: string;
  path: string;
  requestLength: number;
  userAgent: string;
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

  const userId = req.user?.id as string;
  const correlationId = (req.header(syscfg.CORRELATION_ID_HEADER) ||
    uuid()) as string;

  const context: PrismeContext = {
    correlationId,
    userId,
    workspaceId: workspaceId,
    http: {
      originalUrl: req.originalUrl,
      method: req.method,
      ip:
        <string>req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        req.ip,
      path: req.path,
      hostname: req.hostname,
      requestLength: req.socket.bytesRead,
      userAgent: req.get('User-Agent') as string,
    },
  };

  req.context = context;
  req.logger = logger.child(context);
  req.broker = broker.child(context);

  res.set(syscfg.CORRELATION_ID_HEADER, correlationId);
  if (correlationId) {
    req.headers[syscfg.CORRELATION_ID_HEADER] = correlationId;
  }

  if (userId) {
    req.headers[syscfg.USER_ID_HEADER] = userId;
  }

  next();
}
