'use strict';
import http from 'http';
import {
  APP_NAME,
  CONTEXTS_CACHE,
  PERMISSIONS_STORAGE_MONGODB_OPTIONS,
  PORT,
  WORKSPACES_STORAGE_OPTIONS,
  WORKSPACES_STORAGE_TYPE,
} from '../config';
import { initAccessManager } from './permissions';
import { init as initAPI } from './api';
import { initEDA } from './eda';
import { uncaughtExceptionHandler } from './errors';
import '@prisme.ai/types';
import Runtime from './services/runtime';
import { Workspaces } from './services/workspaces';
import { Apps } from './services/apps';
import { Schedules } from './services/schedules';
import { buildCache } from './cache';

process.on('uncaughtException', uncaughtExceptionHandler);

const broker = initEDA();
const schedulesBroker = initEDA(`${APP_NAME}-schedules`);
const workspacesSynchroBroker = initEDA(`${APP_NAME}-workspaces-synchro`);

(async function () {
  await Promise.all([
    broker.ready,
    schedulesBroker.ready,
    workspacesSynchroBroker.ready,
  ]);

  const accessManager = initAccessManager(
    PERMISSIONS_STORAGE_MONGODB_OPTIONS,
    broker
  );
  accessManager.start();

  const cache = await buildCache(CONTEXTS_CACHE);
  await cache.connect();

  const apps = new Apps(
    WORKSPACES_STORAGE_TYPE,
    WORKSPACES_STORAGE_OPTIONS[WORKSPACES_STORAGE_TYPE]
  );
  const workspaces = new Workspaces(
    WORKSPACES_STORAGE_TYPE,
    WORKSPACES_STORAGE_OPTIONS[WORKSPACES_STORAGE_TYPE],
    apps,
    workspacesSynchroBroker,
    accessManager
  );
  const runtime = new Runtime(broker, workspaces, cache, accessManager);
  const schedules = new Schedules(schedulesBroker, apps);

  runtime.start();
  workspaces.startLiveUpdates();
  schedules.start();

  async function exit() {
    await Promise.all([
      schedules.close(),
      broker.close(),
      schedulesBroker.close(),
      workspacesSynchroBroker.close(),
    ]);
    process.exit(0);
  }

  process.on('SIGTERM', exit);
  process.on('SIGINT', exit);

  const app = initAPI(runtime, broker, accessManager);
  const httpServer = http.createServer(app);
  httpServer.listen(PORT, function () {
    console.log(`${APP_NAME} listening on ${PORT}.`);
  });
})();
