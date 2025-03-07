import { logger } from '../logger';
import { NextFunction, Request, Response } from 'express';
import onFinished from 'on-finished';
import { syscfg } from '../config';

export default (req: Request, res: Response, next: NextFunction) => {
  if (
    req.path &&
    req.path.startsWith('/sys/healthcheck') &&
    !syscfg.ENABLE_HEALTHCHECK_LOGS
  ) {
    return next();
  }
  const time0 = Date.now();
  onFinished(res, () => {
    const responseTime = Date.now() - time0;
    const trace = {
      date: new Date().toISOString(),
      ...(req.context || {}),
      service: req.service,
      http: {
        ...(req.context?.http || {}),
        responseCode: res.statusCode,
        responseLength: res.getHeader('content-length'),
        responseDuration: responseTime,
      },
    };

    logger.info(trace);
  });
  next();
};
