import { Application, static as staticFolder } from 'express';

import sys from './sys';
import initWorkspaces from './workspaces';
import initAutomations from './automations';
import initApps from './apps';
import initAppInstances from './appInstances';
import DSULStorage from '../../services/DSULStorage';
import initPages from './pages';
import initFiles from './files';
import FileStorage from '../../services/FileStorage';
import { UPLOADS_STORAGE_FILESYSTEM_DIRPATH } from '../../../config';

export const init = (
  app: Application,
  workspacesStorage: DSULStorage,
  appsStorage: DSULStorage,
  uploadsStorage: FileStorage
): void => {
  const root = '/v2';
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

  const pages = initPages(workspacesStorage, appsStorage);
  app.use(`${root}/workspaces/:workspaceId/pages`, pages);
  app.use(`${root}/pages`, pages);

  const files = initFiles(uploadsStorage);
  app.use(`${root}/workspaces/:workspaceId/files`, files);
  app.use(`${root}/files`, staticFolder(UPLOADS_STORAGE_FILESYSTEM_DIRPATH));
};
export default init;
