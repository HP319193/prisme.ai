import { Broker } from '@prisme.ai/broker';
import { NextFunction, Request, Response } from 'express';
import {
  CORRELATION_ID_HEADER,
  USER_ID_HEADER,
  SESSION_ID_HEADER,
} from '../../../config';
import { logger } from '../../logger';
import { uniqueId } from '../../utils';

export interface HTTPContext {
  hostname: string;
  originalUrl: string;
  baseUrl: string;
  method: string;
  ip: string;
  path: string;
}

export interface PrismeContext {
  app?: string;
  correlationId: string;
  userId: string;
  sessionId: string;
  workspaceId?: string;
  http?: HTTPContext;
}

export function requestDecorator(broker: Broker) {
  return (req: Request, res: Response, next: NextFunction) => {
    const workspaceIdPattern = /^\/v2\/workspaces\/([\w-]+)/;
    const workspaceId = req.path.match(workspaceIdPattern)?.[1];

    const hostname = req.headers['x-forwarded-host'] || req.headers['host'];
    const context: PrismeContext = {
      correlationId: (req.header(CORRELATION_ID_HEADER) ||
        uniqueId()) as string,
      userId: req.header(USER_ID_HEADER) as string,
      sessionId: req.header(SESSION_ID_HEADER) as string,
      workspaceId: workspaceId,
      http: {
        originalUrl: req.originalUrl,
        method: req.method,
        ip: req.ip,
        path: req.path,
        hostname: req.hostname,
        baseUrl: `${req.protocol}://${hostname}`,
      },
    };

    req.context = context;
    req.logger = logger.child(context);
    req.broker = broker.child(context);

    next();
  };
}
