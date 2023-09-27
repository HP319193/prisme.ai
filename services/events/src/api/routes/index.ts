import http from 'http';
import { Application } from 'express';

import sys from './sys';
import { initEventsRoutes } from './events';
import { initUsageRoutes } from './usage';
import { initSearchRoutes } from './search';
import { initWebsockets } from './websockets';
import { initCleanupRoutes } from './cleanup';
import { Subscriptions } from '../../services/events/Subscriptions';
import { EventsStore } from '../../services/events/store';
import { Cache } from '../../cache';

export const init = (
  app: Application,
  httpServer: http.Server,
  eventsSubscription: Subscriptions,
  eventsStore: EventsStore,
  cache: Cache
) => {
  const io = initWebsockets(httpServer, eventsSubscription, cache);

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

  return { io };
};
export default init;
