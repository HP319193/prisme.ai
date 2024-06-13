'use strict';
import http from 'http';
import express from 'express';
import {
  APP_NAME,
  EVENTS_TOPICS_CACHE,
  EVENTS_STORAGE_ES_OPTIONS,
  PERMISSIONS_STORAGE_MONGODB_OPTIONS,
  PORT,
} from '../config';

import { initAPI } from './api';
import { broker } from './eda';
import { uncaughtExceptionHandler } from './errors';
import '@prisme.ai/types';
import { buildEventsStore } from './services/events/store';
import { initAccessManager } from './permissions';
import { buildCache } from './cache';
import { syncEventStoreWithEDA } from './services/events/syncEventStoreWithEDA';
import { Subscriptions } from './services/events/subscriptions';
import { ClusterNode } from './services/cluster';

process.on('uncaughtException', uncaughtExceptionHandler);

(async function () {
  const app = express();
  const httpServer = http.createServer(app);

  const accessManager = initAccessManager(
    PERMISSIONS_STORAGE_MONGODB_OPTIONS,
    broker
  );
  await accessManager.start();

  // Prepare events persistence
  const store = buildEventsStore(EVENTS_STORAGE_ES_OPTIONS);

  // Prepare subscribers cache & manager
  const cache = await buildCache(EVENTS_TOPICS_CACHE);
  await cache.connect();

  const cluster = new ClusterNode(broker, cache);
  await cluster.start();

  const subscriptions = new Subscriptions(
    broker,
    accessManager,
    cache,
    cluster
  );
  // Do not start listening to events before we sync with current subscribers list, otherwise they would never receive their events
  await subscriptions.initClusterSynchronization();

  async function exit() {
    console.log('Closing cluster synchronization ...');
    await cluster.close();
    console.log('Closing subscriptions ...');
    await subscriptions.close();
    console.log('Closing broker ...');
    await broker.close();
    console.log('Closing http server ...');
    httpServer.close();
    console.log('Exit.');
    process.exit(0);
  }

  await broker.ready;
  process.on('SIGTERM', exit);
  process.on('SIGINT', exit);

  // Init HTTP api & websockets
  await initAPI(
    app,
    httpServer,
    store,
    broker,
    accessManager,
    cache,
    subscriptions
  );

  const saveEvent = syncEventStoreWithEDA(store, broker);

  // Centralize here events persistence + websockets so we avoid having 2 separate redis sockets (& corresponding overhead)
  broker.all(async (event, broker, { logger }) => {
    logger.trace({ msg: 'Received event', event });

    // TODO should not we stop listening to events when hitting BatchExecStream highWaterMark ? But only for persistence, so keeping listening to events for socketio transmission from a separate broker socket ?
    // Or, rather store pending events in a persistence queue to keep this single & central broker socket ?
    saveEvent(event);

    if (!event.source.workspaceId) {
      subscriptions.push(event);
    }

    return true;
  });

  httpServer.listen(PORT, function () {
    console.log(`${APP_NAME} listening on ${PORT}`);
  });
})();
