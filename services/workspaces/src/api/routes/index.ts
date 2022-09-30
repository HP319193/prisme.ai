import { Application, static as staticFolder } from 'express';

import sys from './sys';
import initMigrate from './migrate';
import initWorkspaces from './workspaces';
import initAutomations from './automations';
import initApps from './apps';
import initAppInstances from './appInstances';
import DSULStorage from '../../services/DSULStorage';
import { initPagesBackoffice, initPagesPublic } from './pages';
import initFiles from './files';
import FileStorage from '../../services/FileStorage';
import { UPLOADS_STORAGE_FILESYSTEM_DIRPATH } from '../../../config';
import { AccessManager } from '../../permissions';
import { Broker } from '@prisme.ai/broker';

export const init = (
  app: Application,
  workspacesStorage: DSULStorage,
  appsStorage: DSULStorage,
  uploadsStorage: FileStorage,
  accessManager: AccessManager,
  broker: Broker
): void => {
  const root = '/v2';
  app.use(
    `/sys/migrate`,
    initMigrate(workspacesStorage, accessManager, broker)
  );
  app.use(`/sys`, sys);

  app.use(
    `${root}/workspaces`,
    initWorkspaces(workspacesStorage, appsStorage, uploadsStorage)
  );
  app.use(
    `${root}/workspaces/:workspaceId/automations`,
    initAutomations(workspacesStorage, appsStorage)
  );

  app.use(
    `${root}/workspaces/:workspaceId/apps`,
    initAppInstances(workspacesStorage, appsStorage)
  );
  app.use(`${root}/apps`, initApps(workspacesStorage, appsStorage));

  // Pages public GET
  app.use(`${root}/pages`, initPagesPublic(workspacesStorage, appsStorage));
  // Pages admin routes
  app.use(
    `${root}/workspaces/:workspaceId/pages`,
    initPagesBackoffice(workspacesStorage, appsStorage)
  );
  // Legacy
  app.use(`${root}/pages`, initPagesBackoffice(workspacesStorage, appsStorage));

  const files = initFiles(uploadsStorage);
  app.use(`${root}/workspaces/:workspaceId/files`, files);
  app.use(`${root}/files`, staticFolder(UPLOADS_STORAGE_FILESYSTEM_DIRPATH));
};
export default init;
