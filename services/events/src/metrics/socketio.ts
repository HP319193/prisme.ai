import promClient from 'prom-client';
import { Server } from 'socket.io';

// Forked from https://github.com/shamil/socket.io-prometheus/blob/master/index.js

let metrics: ReturnType<typeof initializeMetrics>;

function strToBytes(str: string) {
  try {
    str = typeof str === 'string' ? str : JSON.stringify(str);
  } catch (e) {
    return 0;
  }

  return Buffer.byteLength(str || '', 'utf8');
}

function beforeHook(obj: any, methods: any, hook: any) {
  if (!obj) return false;
  if (!Array.isArray(methods)) methods = [methods];

  methods.forEach((meth: any) => {
    const orig = obj[meth];
    if (!orig) return;

    obj[meth] = function () {
      try {
        hook(arguments);
      } catch (e) {
        console.error(e);
      }

      return orig.apply(this, arguments);
    };
  });
}

function initializeMetrics(opts: SocketioMetricsOptions) {
  const labelNames = Object.keys(opts.labels || {});
  const { Counter, Gauge } = promClient;

  return {
    connectedSockets: new Gauge({
      name: 'socket_io_connected',
      help: 'Number of currently connected sockets',
      labelNames,
    }),

    connectTotal: new Counter({
      name: 'socket_io_connect_total',
      help: 'Total count of socket.io connection requests',
      labelNames,
    }),

    disconnectTotal: new Counter({
      name: 'socket_io_disconnect_total',
      help: 'Total count of socket.io disconnections',
      labelNames,
    }),

    eventsReceivedTotal: new Counter({
      name: 'socket_io_events_received_total',
      help: 'Total count of socket.io received events',
      labelNames,
    }),

    eventsSentTotal: new Counter({
      name: 'socket_io_events_sent_total',
      help: 'Total count of socket.io sent events',
      labelNames,
    }),

    bytesReceived: new Counter({
      name: 'socket_io_receive_bytes',
      help: 'Total socket.io bytes received',
      labelNames,
    }),

    bytesTransmitted: new Counter({
      name: 'socket_io_transmit_bytes',
      help: 'Total socket.io bytes transmitted',
      labelNames,
    }),
  };
}

export interface SocketioMetricsOptions {
  labels?: Record<string, string>;
}
const blacklistedEvents = new Set([
  'error',
  'connect',
  'disconnect',
  'disconnecting',
  'newListener',
  'removeListener',
]);
export function initSocketioMetrics(io: Server, opts: SocketioMetricsOptions) {
  if (metrics == null) {
    metrics = initializeMetrics(opts);
  }
  const { labels = {} } = opts;

  const connectedSockets = metrics.connectedSockets;
  const connectTotal = metrics.connectTotal;
  const disconnectTotal = metrics.disconnectTotal;
  const eventsReceivedTotal = metrics.eventsReceivedTotal;
  const eventsSentTotal = metrics.eventsSentTotal;
  const bytesReceived = metrics.bytesReceived;
  const bytesTransmitted = metrics.bytesTransmitted;

  // listen to new connection events
  io.on('connect', (socket) => {
    connectTotal.inc(labels);
    connectedSockets.inc(labels);
    socket.on('disconnect', () => {
      connectedSockets.dec(labels);
      disconnectTotal.inc(labels);
    });

    beforeHook(socket, 'emit', ([event, eventStr]: [any, string]) => {
      if (blacklistedEvents.has(event)) {
        return;
      }

      bytesTransmitted.inc(labels, strToBytes(eventStr));
      eventsSentTotal.inc(labels);
    });

    beforeHook(socket, 'onAny', (args: any) => {
      const event = args[0];
      const cbPos = args.length - 1;

      if (blacklistedEvents.has(event)) {
        return;
      }

      // get original callback function
      const origCb =
        typeof args[cbPos] === 'function' ? args[cbPos] : undefined;
      if (!origCb) return false;

      args[cbPos] = function () {
        const eventStr = Array.prototype.slice.call(arguments)[0];

        bytesReceived.inc(labels, strToBytes(eventStr));
        eventsReceivedTotal.inc(labels);

        return origCb.apply(this, arguments);
      };
    });
  });
}
