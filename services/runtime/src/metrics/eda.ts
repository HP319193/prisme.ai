import { getMetrics } from '../eda';
import { Broker } from '@prisme.ai/broker';
import client from 'prom-client';

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

  const processedLabels = ['consumer', 'workspace', 'producer', 'serviceTopic'];
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
  const eventSizeMetrics = new client.Histogram({
    name: 'events_size',
    help: 'Events size histogram labeled with ' + processedLabels.join(', '),
    labelNames: processedLabels,
    registers: [registry],
    buckets: [1, 10, 50, 100, 300, 500, 700, 1000, 2000],
  });

  broker.onProcessedEventCallback = (event, metrics) => {
    // Do not observe waits events as their serviceTopic is always different and cause high memory leaks + eventloop duration
    if (
      (event?.source?.serviceTopic || '').startsWith('runtime.waits.fulfilled')
    ) {
      return;
    }
    const vals = {
      consumer: broker.service,
      workspace: event?.source?.workspaceId,
      producer: event?.source?.host?.service,
      serviceTopic: event?.source?.serviceTopic,
    };
    processDurationMetrics.labels(vals).observe(metrics.procesDuration);
    pickupDelayMetrics.labels(vals).observe(metrics.pickupDelay);
    eventSizeMetrics.labels(vals).observe(event?.size);
  };
}
