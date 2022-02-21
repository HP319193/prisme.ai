import { Application } from 'express';

import sys from './sys';
import workspaces from './workspaces';
import automations from './automations';
import apps from './apps';

export const init = (app: Application): void => {
  const root = '/v2';
  app.use(`/sys`, sys);
  app.use(`${root}/workspaces`, workspaces);
  app.use(`${root}/workspaces/:workspaceId/automations`, automations);
  app.use(`${root}/apps`, apps);
};
export default init;
