import { NextFunction, Request, Response } from 'express';
import { syscfg } from '../config';
import { logger } from '../logger';
import { v4 as uuid } from 'uuid';
import { broker } from '../eda';
import { Role } from '../types/permissions';
import { cleanIncomingRequest } from './validation';

export interface HTTPContext {
  hostname: string;
  originalUrl: string;
  method: string;
  ip?: string;
  path: string;
  requestLength: number;
  userAgent: string;
}

export interface PrismeContext {
  app?: string;
  correlationId: string;
  userId: string;
  sessionId: string;
  ip?: string;
  workspaceId?: string;
  http?: HTTPContext;
}

export function extractRequestIp(req: Request) {
  return (
    <string>req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip
  );
}

export function extractRequestCorrelationId(req: Request) {
  if (req.context?.correlationId) {
    return req.context.correlationId;
  }
  return syscfg.OVERWRITE_CORRELATION_ID_HEADER ||
    !req.header(syscfg.CORRELATION_ID_HEADER)
    ? uuid()
    : (req.header(syscfg.CORRELATION_ID_HEADER) as string);
}

export function requestDecorator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  cleanIncomingRequest(req);

  const workspaceIdPattern = /^\/v2\/workspaces\/([\w-]+)/;
  const workspaceId = req.path.match(workspaceIdPattern)?.[1];

  const userId = req.user?.id as string;
  const sessionId = req.session.prismeaiSessionId;
  const correlationId = extractRequestCorrelationId(req);

  const adminEmails = syscfg.SUPER_ADMIN_EMAILS?.split(',').map((email) =>
    email.trim()
  );
  const ip = extractRequestIp(req);
  const context: PrismeContext = {
    correlationId,
    userId,
    sessionId,
    ip,
    workspaceId: workspaceId,
    http: {
      originalUrl: req.originalUrl,
      method: req.method,
      ip,
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

  delete req.headers[syscfg.ROLE_HEADER]; // remove role header from request, this can only be set by the api gateway itself
  if (req.user?.email && adminEmails.includes(req.user.email)) {
    req.headers[syscfg.ROLE_HEADER] = Role.SuperAdmin;
  }

  if (userId) {
    req.headers[syscfg.USER_ID_HEADER] = userId;
  }

  if (sessionId) {
    req.headers[syscfg.SESSION_ID_HEADER] = sessionId;
    res.set(syscfg.SESSION_ID_HEADER, sessionId);
  }

  if (req.user?.authData) {
    req.headers[syscfg.AUTH_DATA_HEADER] = JSON.stringify(req.user?.authData);
  }

  next();
}
