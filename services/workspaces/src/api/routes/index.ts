import { Application } from 'express';

import sys from './sys';
import initMigrate from './migrate';
import initWorkspaces from './workspaces';
import initAutomations from './automations';
import initSecurity from './security';
import initApps from './apps';
import initAppInstances from './appInstances';
import { initPagesBackoffice, initPagesPublic } from './pages';
import initFiles, { initDownloadProxy } from './files';
import FileStorage from '../../services/FileStorage';
import { AccessManager } from '../../permissions';
import { Broker } from '@prisme.ai/broker';
import { DSULStorage } from '../../services/DSULStorage';

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

  /**
   * Security related routes
   */
  app.use(
    `${root}/workspaces/:workspaceId/security`,
    initSecurity(dsulStorage)
  );

  const files = initFiles(uploadsStorage);
  app.use(`${root}/workspaces/:workspaceId/files`, files);
  app.use(`${root}/files`, initDownloadProxy(accessManager, uploadsStorage));
};
export default init;
