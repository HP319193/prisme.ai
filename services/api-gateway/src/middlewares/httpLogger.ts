import { logger } from "../logger";
import { NextFunction, Request, Response } from "express";
import onFinished from "on-finished";

export default (req: Request, res: Response, next: NextFunction) => {
  const time0 = Date.now();
  onFinished(res, () => {
    const responseTime = Date.now() - time0;
    const trace = {
      date: new Date().toISOString(),
      ...(req.context || {}),
      service: req.service,
      http: {
        ...(req.context?.http || {}),
        response_code: res.statusCode,
        response_length: res.getHeader("content-length"),
        response_duration: responseTime,
      },
    };

    logger.info(trace);
  });
  next();
};
