'use strict';
import http from 'http';
import {
  APP_NAME,
  PERMISSIONS_STORAGE_MONGODB_OPTIONS,
  PORT,
  UPLOADS_PUBLIC_STORAGE_S3_OPTIONS,
  UPLOADS_STORAGE_OPTIONS,
  UPLOADS_STORAGE_TYPE,
  WORKSPACES_STORAGE_OPTIONS,
  WORKSPACES_STORAGE_TYPE,
} from '../config';

import { initAPI } from './api';
import { initEDA } from './eda';
import { uncaughtExceptionHandler } from './errors';
import '@prisme.ai/types';
import { initAccessManager } from './permissions';
import {
  initWorkspacesConfigSyncing,
  initDetailedPagesSyncing,
  initOAuthClientsSyncing,
} from './services';
import FileStorage from './services/FileStorage';
import { autoremoveExpiredUploads } from './services/uploads';
import buildStorage from './storage';
import { DSULStorage, DSULType } from './services/DSULStorage';

process.on('uncaughtException', uncaughtExceptionHandler);

async function exit() {
  await broker.close();
  process.exit(0);
}
process.on('SIGTERM', exit);
process.on('SIGINT', exit);

const broker = initEDA();

const accessManager = initAccessManager(
  PERMISSIONS_STORAGE_MONGODB_OPTIONS,
  broker
);
accessManager.start();

const dsulStorage = new DSULStorage(
  buildStorage(
    WORKSPACES_STORAGE_TYPE,
    WORKSPACES_STORAGE_OPTIONS[WORKSPACES_STORAGE_TYPE]
  ),
  DSULType.DSULIndex
);

const uploadsStorage = new FileStorage(
  buildStorage(
    UPLOADS_STORAGE_TYPE,
    UPLOADS_STORAGE_OPTIONS[UPLOADS_STORAGE_TYPE]
  ),
  // For now, only S3 supports 2 distincts public/private buckets
  UPLOADS_PUBLIC_STORAGE_S3_OPTIONS.bucket
    ? buildStorage(UPLOADS_STORAGE_TYPE, UPLOADS_PUBLIC_STORAGE_S3_OPTIONS)
    : undefined
);

autoremoveExpiredUploads(uploadsStorage, accessManager);

const app = initAPI(accessManager, dsulStorage, uploadsStorage, broker);

initWorkspacesConfigSyncing(accessManager, broker, dsulStorage);
initDetailedPagesSyncing(accessManager, broker, dsulStorage);
initOAuthClientsSyncing(accessManager, broker);

const httpServer = http.createServer(app);

httpServer.listen(PORT, function () {
  console.log(`${APP_NAME} listening on ${PORT}.`);
});
