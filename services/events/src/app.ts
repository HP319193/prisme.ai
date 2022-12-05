'use strict';
import http from 'http';
import express from 'express';
import {
  APP_NAME,
  EVENTS_TOPICS_CACHE,
  EVENTS_BUFFER_FLUSH_AT,
  EVENTS_BUFFER_FLUSH_EVERY,
  EVENTS_BUFFER_HIGH_WATERMARK,
  EVENTS_STORAGE_ES_OPTIONS,
  PERMISSIONS_STORAGE_MONGODB_OPTIONS,
  PORT,
} from '../config';

import { initAPI } from './api';
import { broker } from './eda';
import { uncaughtExceptionHandler } from './errors';
import '@prisme.ai/types';
import { Subscriptions } from './services/events/Subscriptions';
import BatchExecStream from './utils/BatchExecStream';
import { buildEventsStore } from './services/events/store';
import { initAccessManager } from './permissions';
import { buildCache } from './cache';

process.on('uncaughtException', uncaughtExceptionHandler);

(async function () {
  async function exit() {
    await broker.close();
    httpServer.close();
    process.exit(0);
  }
  process.on('SIGTERM', exit);
  process.on('SIGINT', exit);

  const app = express();
  const httpServer = http.createServer(app);

  const accessManager = initAccessManager(PERMISSIONS_STORAGE_MONGODB_OPTIONS);
  accessManager.start();

  const cache = await buildCache(EVENTS_TOPICS_CACHE);
  await cache.connect();

  const subscriptions = new Subscriptions(broker, accessManager, cache);
  subscriptions.start();
  const store = buildEventsStore(EVENTS_STORAGE_ES_OPTIONS);

  const eventsStorageStream = new BatchExecStream<Prismeai.PrismeEvent>({
    highWaterMark: EVENTS_BUFFER_HIGH_WATERMARK,
    flushAt: EVENTS_BUFFER_FLUSH_AT,
    flushEvery: EVENTS_BUFFER_FLUSH_EVERY,
    bulkExec: async (events) => {
      await store.bulkInsert(events);
    },
  });
  broker.all(async function saveEvent(event): Promise<boolean> {
    if (event?.options?.persist === false) {
      return true;
    }

    await eventsStorageStream.write(event);
    return true;
  });

  initAPI(app, httpServer, subscriptions, store, accessManager, cache);

  httpServer.listen(PORT, function () {
    console.log(`${APP_NAME} listening on ${PORT}.`);
  });
})();
