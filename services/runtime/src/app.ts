'use strict';
import http from 'http';
import {
  APP_NAME,
  CONTEXTS_CACHE,
  PORT,
  WORKSPACES_STORAGE_TYPE,
} from '../config';

import { init as initAPI } from './api';
import { broker } from './eda';
import { uncaughtExceptionHandler } from './errors';
import '@prisme.ai/types';
import Runtime from './services/runtime';
import { Workspaces } from './services/workspaces';
import { buildCache } from './cache';
import { Apps } from './services/apps';

process.on('uncaughtException', uncaughtExceptionHandler);

async function exit() {
  await broker.close();
  process.exit(0);
}

process.on('SIGTERM', exit);
process.on('SIGINT', exit);

(async function () {
  await broker.ready;
  const cache = await buildCache(CONTEXTS_CACHE);

  const apps = new Apps(WORKSPACES_STORAGE_TYPE);
  const workspaces = new Workspaces(WORKSPACES_STORAGE_TYPE, apps, broker);
  const runtime = new Runtime(broker, workspaces, cache);

  runtime.start();
  workspaces.startLiveUpdates();

  const app = initAPI(runtime);
  const httpServer = http.createServer(app);
  httpServer.listen(PORT, function () {
    console.log(`${APP_NAME} listening on ${PORT}.`);
  });
})();
