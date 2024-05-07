import { Application } from 'express';
import Runtime from '../../services/runtime';

import sys from './sys';
import webhooks from './webhooks';
import automations from './automations';
import { Cache } from '../../cache';
import { Broker } from '@prisme.ai/broker';

export const init = (
  app: Application,
  runtime: Runtime,
  broker: Broker,
  cache: Cache
): void => {
  const root = '/v2';
  app.use(`/sys`, sys(broker, cache));
  app.use(`${root}/workspaces/:workspaceId/webhooks`, webhooks(runtime));
  app.use(`${root}/workspaces/:workspaceId/test`, automations(runtime));
};
export default init;
