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
import { Subscriptions } from './services/events/Subscriptions';
import { buildEventsStore } from './services/events/store';
import { initAccessManager } from './permissions';
import { buildCache } from './cache';
import { syncEventStoreWithEDA } from './services/events/syncEventStoreWithEDA';

process.on('uncaughtException', uncaughtExceptionHandler);

(async function () {
  async function exit() {
    await broker.close();
    httpServer.close();
    process.exit(0);
  }

  await broker.ready;
  process.on('SIGTERM', exit);
  process.on('SIGINT', exit);

  const app = express();
  const httpServer = http.createServer(app);

  const accessManager = initAccessManager(
    PERMISSIONS_STORAGE_MONGODB_OPTIONS,
    broker
  );
  accessManager.start();

  const cache = await buildCache(EVENTS_TOPICS_CACHE);
  await cache.connect();

  const subscriptions = new Subscriptions(broker, accessManager, cache);
  subscriptions.start();
  const store = buildEventsStore(EVENTS_STORAGE_ES_OPTIONS);

  syncEventStoreWithEDA(store, broker);
  initAPI(app, httpServer, subscriptions, store, accessManager, cache);

  httpServer.listen(PORT, function () {
    console.log(`${APP_NAME} listening on ${PORT}`);
  });
})();
