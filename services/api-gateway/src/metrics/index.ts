import { Application, NextFunction, Request, Response } from 'express';
import client from 'prom-client';
import { initEDAMetrics } from './eda';
import { httpMetricMiddleware, initHttpMetric } from './http';
import { syscfg } from '../config';

export async function initMetrics(app: Application) {
  app.use('/metrics', authorizeBearer, metricsMiddleware);
  app.use(httpMetricMiddleware);
}

async function authorizeBearer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers['authorization'];

  if (authorization === `Bearer ${syscfg.INTERNAL_API_KEY}`) {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
}
async function metricsMiddleware(req: Request, res: Response) {
  res.setHeader('Content-Type', registry.contentType);
  res.send(await registry.metrics());
}

// Create a Registry to register the metrics
const registry = new client.Registry();
client.collectDefaultMetrics({
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register: registry,
});

initHttpMetric(registry);
initEDAMetrics(registry);
