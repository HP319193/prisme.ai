import { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import Agent from 'agentkeepalive';
//@ts-ignore
import followRedirects from 'follow-redirects';
import { GatewayConfig, syscfg } from '../config';
import errorHandler from '../middlewares/errorHandler';
import { PayloadTooLarge } from '../types/errors';
import { logger } from '../logger';

followRedirects.maxBodyLength = syscfg.UPLOADS_MAX_SIZE;
export interface Params {
  service: string;
  websockets?: boolean;
  pathRewrite?: {
    [k: string]: string;
  };
  router?: {
    [k: string]: string;
  };
  timeout?: number;
}

export const validatorSchema = {
  service: 'required|string|service_exists',
  websockets: 'boolean',
  pathRewrite: {},
  'pathRewrite.*': 'string',
  router: {},
  'router.*': 'string',
  timeout: 'number', // seconds
};

const keepaliveAgent = new Agent({
  keepAlive: true,
  freeSocketTimeout: 4000,
  timeout: 0,
});

export async function init(params: Params, gtwcfg: GatewayConfig) {
  const service = gtwcfg.service(params.service);
  const timeout = params.timeout || 20000;
  const middleware = createProxyMiddleware({
    target: service.url,
    ws: params.websockets,
    pathRewrite: params.pathRewrite,
    router: params.router,
    changeOrigin: true,
    followRedirects: true,
    timeout: timeout,
    proxyTimeout: timeout,
    xfwd: syscfg.X_FORWARDED_HEADERS,
    agent: keepaliveAgent,
    onProxyReqWs(cr, req, socket) {
      // Listen to socket errors so they don't make the whole server crash
      socket.on('error', (err) => {
        logger.error({
          msg: 'Socket error',
          err,
        });
      });

      // Clean any internal header on WS upgrade as these requests are not intercepted by our express authentication HTTP middlewares
      // Instead, let prismeai-events authenticate reqs himself
      for (let header in req.headers) {
        if (
          header.startsWith('x-prismeai-') &&
          !syscfg.ALLOWED_PRISMEAI_HEADERS_FROM_OUTSIDE.includes(header)
        ) {
          cr.removeHeader(header);
        }
      }
    },
    onError(err, req, res) {
      if ((<any>err).code === 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED') {
        err = new PayloadTooLarge(
          req.socket.bytesRead,
          syscfg.UPLOADS_MAX_SIZE
        );
      }
      errorHandler(err, req, res);
    },
  });

  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = params.timeout || 20000;
    req.service = params.service;
    res.setTimeout(timeout, () => {
      try {
        res.status(408).setHeader('Content-Type', 'application/json');
      } catch {}
      try {
        res.send({ error: 'TimeoutError', timeout });
      } catch {}
    });
    return middleware(req, res, next);
  };
}
