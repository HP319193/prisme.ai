import { NextFunction, Request, Response } from 'express';
import client from 'prom-client';
import onFinished from 'on-finished';
import { Server } from 'socket.io';

const httpMetricName = 'http_request_duration_seconds';
const labels = ['status_code', 'path', 'method'];

let httpMetric: client.Histogram<string>;
export async function initHttpMetric(registry: client.Registry) {
  httpMetric = new client.Histogram({
    name: httpMetricName,
    help:
      'duration histogram of http responses labeled with: ' + labels.join(', '),
    labelNames: labels,
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    registers: [registry],
  });
}

export async function httpMetricMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const labels: Record<string, any> = {
    method: req.method,
    path: req.path,
  };
  const sendMetrics = httpMetric.startTimer(labels);
  onFinished(res, () => {
    labels.status_code = res.statusCode;
    sendMetrics();
  });

  next();
}
