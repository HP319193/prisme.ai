import { Application, Request, Response } from 'express';
import client from 'prom-client';
import { initEDAMetrics } from './eda';
import { httpMetricMiddleware, initHttpMetric } from './http';
//@ts-ignore
import { Server } from 'socket.io';
import { initSocketioMetrics } from './socketio';
import { Subscriptions } from '../services/events/subscriptions';

export async function initMetrics(
  app: Application,
  io: Server,
  subscriptions: Subscriptions
) {
  app.use('/metrics', metricsMiddleware);
  app.use(httpMetricMiddleware);

  const labels: Record<string, string> = process.env.HOSTNAME
    ? {
        pod: process.env.HOSTNAME,
      }
    : {};
  initSocketioMetrics(io, {
    labels,
  });

  // Init some subscriptions
  initSubscriberMetrics(subscriptions, {
    labels,
  });
}

async function initSubscriberMetrics(
  subscriptions: Subscriptions,
  opts: { labels: Record<string, any> }
) {
  const labels = opts.labels || {};
  const labelNames = Object.keys(labels);

  const totalSubscribers = new client.Gauge({
    name: 'subscriptions_total',
    help: 'Total count of event subscribers in the cluster',
    labelNames,
  });

  setInterval(() => {
    const subscriptionMetrics = subscriptions.metrics();
    totalSubscribers.set(subscriptionMetrics.totalSubscribers || 0);
  }, 5000);
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
