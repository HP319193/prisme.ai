import http from 'http';
import { Application } from 'express';

import sys from './sys';
import { initEventsRoutes } from './events';
import { initUsageRoutes } from './usage';
import { initSearchRoutes } from './search';
import { initWebsockets } from './websockets';
import { initCleanupRoutes } from './cleanup';
import { EventsStore } from '../../services/events/store';
import { Broker } from '@prisme.ai/broker';
import { Subscriptions } from '../../services/events/Subscriptions';

export const init = async (
  app: Application,
  httpServer: http.Server,
  eventsStore: EventsStore,
  broker: Broker,
  subscriptions: Subscriptions
) => {
  const io = await initWebsockets(httpServer, broker, subscriptions);

  const root = '/v2';
  app.use(`/sys/cleanup`, initCleanupRoutes(eventsStore));
  app.use(`/sys`, sys);
  app.use(
    `${root}/workspaces/:workspaceId/events`,
    initEventsRoutes(eventsStore)
  );
  app.use(
    `${root}/workspaces/:workspaceId/usage`,
    initUsageRoutes(eventsStore)
  );
  app.use(
    `${root}/workspaces/:workspaceId/search`,
    initSearchRoutes(eventsStore)
  );
  app.use(`${root}/search`, initSearchRoutes(eventsStore));

  return { io };
};
export default init;
