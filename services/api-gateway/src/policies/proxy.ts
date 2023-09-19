import { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
//@ts-ignore
import followRedirects from 'follow-redirects';
import { GatewayConfig, syscfg } from '../config';

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
  });

  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = params.timeout || 20000;
    req.service = params.service;
    res.setTimeout(timeout, () => {
      res
        .status(408)
        .setHeader('Content-Type', 'application/json')
        .send({ error: 'TimeoutError', timeout });
    });
    return middleware(req, res, next);
  };
}
