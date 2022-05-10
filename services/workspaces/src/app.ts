'use strict';
import http from 'http';
import {
  APP_NAME,
  PERMISSIONS_STORAGE_MONGODB_OPTIONS,
  PORT,
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
import DSULStorage, { DSULType } from './services/DSULStorage';
import { autoinstallApps, syncWorkspacesWithConfigContexts } from './services';
import FileStorage from './services/FileStorage';
import { autoremoveExpiredUploads } from './services/uploads';

process.on('uncaughtException', uncaughtExceptionHandler);

async function exit() {
  await broker.close();
  process.exit(0);
}
process.on('SIGTERM', exit);
process.on('SIGINT', exit);

const broker = initEDA();

const accessManager = initAccessManager(PERMISSIONS_STORAGE_MONGODB_OPTIONS);
accessManager.start();

const workspacesStorage = new DSULStorage(
  DSULType.Workspace,
  WORKSPACES_STORAGE_TYPE,
  WORKSPACES_STORAGE_OPTIONS[WORKSPACES_STORAGE_TYPE]
);

const appsStorage = new DSULStorage(
  DSULType.App,
  WORKSPACES_STORAGE_TYPE,
  WORKSPACES_STORAGE_OPTIONS[WORKSPACES_STORAGE_TYPE]
);

const uploadsStorage = new FileStorage(
  UPLOADS_STORAGE_TYPE,
  UPLOADS_STORAGE_OPTIONS[UPLOADS_STORAGE_TYPE]
);

setTimeout(() => {
  autoinstallApps(appsStorage, accessManager);
}, 20000); // Arbitrary 20 sec delay to make sure app API are ready

autoremoveExpiredUploads(uploadsStorage, accessManager);

const app = initAPI(
  accessManager,
  workspacesStorage,
  appsStorage,
  uploadsStorage,
  broker
);

syncWorkspacesWithConfigContexts(
  accessManager,
  broker,
  workspacesStorage,
  appsStorage
);

const httpServer = http.createServer(app);

httpServer.listen(PORT, function () {
  console.log(`${APP_NAME} listening on ${PORT}.`);
});
