import { getMetrics } from '../eda';
import client from 'prom-client';
import { Broker } from '@prisme.ai/broker';

export async function initEDAMetrics(
  registry: client.Registry,
  broker: Broker
) {
  const pendingLabels = ['event', 'consumer'];
  const pendingMetrics = new client.Gauge({
    name: 'events_pending',
    help: 'Pending events gauge ' + pendingLabels.join(', '),
    labelNames: pendingLabels,
    registers: [registry],
    async collect() {
      const metrics = await getMetrics(broker);
      metrics.pending.events.forEach((cur) => {
        pendingMetrics.set(
          { event: cur.type, consumer: broker.service },
          cur.pending
        );
      });
    },
  });

  const processedLabels = ['event', 'consumer', 'workspace'];
  const processDurationMetrics = new client.Histogram({
    name: 'events_process_duration',
    help:
      'Events processing duration (ms) histogram labeled with ' +
      processedLabels.join(', '),
    labelNames: processedLabels,
    registers: [registry],
    buckets: [10, 50, 100, 300, 500, 700, 1000, 2000, 4000],
  });
  const pickupDelayMetrics = new client.Histogram({
    name: 'events_pickup_delay',
    help:
      'Events pickup delay (ms) histogram labeled with ' +
      processedLabels.join(', '),
    labelNames: processedLabels,
    registers: [registry],
    buckets: [1, 10, 50, 100, 300, 500, 700, 1000, 2000],
  });

  broker.onProcessedEventCallback = (event, metrics) => {
    const vals = {
      event: event.type,
      consumer: broker.service,
      workspace: event?.source?.workspaceId,
    };
    processDurationMetrics.labels(vals).observe(metrics.procesDuration);
    pickupDelayMetrics.labels(vals).observe(metrics.pickupDelay);
  };
}
