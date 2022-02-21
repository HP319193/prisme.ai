import { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { GatewayConfig } from '../config';

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
  const middleware = createProxyMiddleware({
    target: service.url,
    ws: params.websockets,
    pathRewrite: params.pathRewrite,
    router: params.router,
    changeOrigin: true,
    followRedirects: true,
    timeout: params.timeout || 20000,
  });

  return (req: Request, res: Response, next: NextFunction) => {
    req.service = params.service;
    return middleware(req, res, next);
  };
}
