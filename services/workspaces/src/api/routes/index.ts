import { Application } from 'express';

import sys from './sys';
import initWorkspaces from './workspaces';
import initAutomations from './automations';
import initApps from './apps';
import initAppInstances from './appInstances';
import DSULStorage from '../../services/DSULStorage';
import initPages from './pages';

export const init = (
  app: Application,
  workspacesStorage: DSULStorage,
  appsStorage: DSULStorage
): void => {
  const root = '/v2';
  app.use(`/sys`, sys);
  app.use(`${root}/workspaces`, initWorkspaces(workspacesStorage, appsStorage));
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
};
export default init;
