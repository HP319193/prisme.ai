import { Broker } from '@prisme.ai/broker';
import { Application, Request, Response } from 'express';
import client from 'prom-client';
import { initEDAMetrics } from './eda';
import { httpMetricMiddleware, initHttpMetric } from './http';

export async function initMetrics(app: Application, broker: Broker) {
  // Create a Registry to register the metrics
  const registry = new client.Registry();
  client.collectDefaultMetrics({
    prefix: 'node_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    register: registry,
  });

  initHttpMetric(registry);
  initEDAMetrics(registry, broker);

  async function metricsMiddleware(req: Request, res: Response) {
    res.setHeader('Content-Type', registry.contentType);
    res.send(await registry.metrics());
  }

  app.use('/metrics', metricsMiddleware);
  app.use(httpMetricMiddleware);
}
