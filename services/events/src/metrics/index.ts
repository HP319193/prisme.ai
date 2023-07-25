import { Application, Request, Response } from 'express';
import client from 'prom-client';
import { initEDAMetrics } from './eda';
import { httpMetricMiddleware, initHttpMetric } from './http';
//@ts-ignore
import { Server } from 'socket.io';
import { initSocketioMetrics } from './socketio';

export async function initMetrics(app: Application, io: Server) {
  app.use('/metrics', metricsMiddleware);
  app.use(httpMetricMiddleware);
  initSocketioMetrics(io, {
    labels: process.env.HOSTNAME
      ? {
          pod: process.env.HOSTNAME,
        }
      : {},
  });
}

async function metricsMiddleware(req: Request, res: Response) {
  res.setHeader('Content-Type', registry.contentType);
  const metrics = await registry.metrics();
  res.send(metrics);
}

// Create a Registry to register the metrics
const registry = client.register;
client.collectDefaultMetrics({
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register: registry,
  labels: process.env.HOSTNAME
    ? {
        pod: process.env.HOSTNAME,
      }
    : {},
});

initHttpMetric(registry);
initEDAMetrics(registry);
