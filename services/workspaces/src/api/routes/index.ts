import { Application, static as staticFolder } from 'express';

import sys from './sys';
import initMigrate from './migrate';
import initWorkspaces from './workspaces';
import initAutomations from './automations';
import initApps from './apps';
import initAppInstances from './appInstances';
import { initPagesBackoffice, initPagesPublic } from './pages';
import initFiles from './files';
import FileStorage from '../../services/FileStorage';
import { UPLOADS_STORAGE_FILESYSTEM_DIRPATH } from '../../../config';
import { AccessManager } from '../../permissions';
import { Broker } from '@prisme.ai/broker';
import { DSULStorage } from '../../services/dsulStorage';

export const init = (
  app: Application,
  dsulStorage: DSULStorage,
  uploadsStorage: FileStorage,
  accessManager: AccessManager,
  broker: Broker
): void => {
  const root = '/v2';
  app.use(`/sys/migrate`, initMigrate(dsulStorage, accessManager, broker));
  app.use(`/sys`, sys);

  app.use(`${root}/workspaces`, initWorkspaces(dsulStorage, uploadsStorage));
  app.use(
    `${root}/workspaces/:workspaceId/automations`,
    initAutomations(dsulStorage)
  );

  app.use(
    `${root}/workspaces/:workspaceId/apps`,
    initAppInstances(dsulStorage)
  );
  app.use(`${root}/apps`, initApps(dsulStorage));

  // Pages public GET
  app.use(`${root}/pages`, initPagesPublic(dsulStorage));
  // Pages admin routes
  app.use(
    `${root}/workspaces/:workspaceId/pages`,
    initPagesBackoffice(dsulStorage)
  );

  const files = initFiles(uploadsStorage);
  app.use(`${root}/workspaces/:workspaceId/files`, files);
  app.use(`${root}/files`, staticFolder(UPLOADS_STORAGE_FILESYSTEM_DIRPATH));
};
export default init;
