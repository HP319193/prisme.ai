import { Broker } from '@prisme.ai/broker';
import { NextFunction, Request, Response } from 'express';
import {
  CORRELATION_ID_HEADER,
  USER_ID_HEADER,
  SESSION_ID_HEADER,
  AUTH_DATA_HEADER,
} from '../../../config';
import { logger } from '../../logger';
import { uniqueId } from '../../utils';

export interface HTTPContext {
  hostname: string;
  originalUrl: string;
  method: string;
  ip?: string;
  path: string;
}

export interface PrismeContext {
  app?: string;
  correlationId: string;
  userId: string;
  socketId?: string;
  ip?: string;
  sessionId: string;
  workspaceId?: string;
  http?: HTTPContext;
  automationDepth?: number;
}

export function requestDecorator(broker: Broker) {
  return (req: Request, res: Response, next: NextFunction) => {
    const workspaceIdPattern = /^\/v2\/workspaces\/([\w-]+)/;
    const workspaceId = req.path.match(workspaceIdPattern)?.[1];

    const context: PrismeContext = {
      correlationId: (req.header(CORRELATION_ID_HEADER) ||
        uniqueId()) as string,
      userId: req.header(USER_ID_HEADER) as string,
      sessionId: req.header(SESSION_ID_HEADER) as string,
      ip: req.ip,
      workspaceId: workspaceId,
      http: {
        originalUrl: req.originalUrl,
        method: req.method,
        ip: req.ip,
        path: req.path,
        hostname: req.hostname,
      },
    };

    req.context = context;
    req.logger = logger.child(context);
    req.broker = broker.child(context);

    if (typeof req.header(AUTH_DATA_HEADER) === 'string') {
      try {
        req.authData = JSON.parse(req.header(AUTH_DATA_HEADER)!);
      } catch {
        req.logger.error({
          msg: `Could not parse JSON from authData header '${AUTH_DATA_HEADER}'`,
        });
      }
    }

    next();
  };
}
