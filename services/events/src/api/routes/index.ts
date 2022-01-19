import http from "http";
import { Application } from "express";

import sys from "./sys";
import { initEventsRoutes } from "./events";
import { initWebsockets } from "./websockets";
import { Subscriptions } from "../../services/events/Subscriptions";
import { EventsStore } from "../../services/events/store";

export const init = (
  app: Application,
  httpServer: http.Server,
  eventsSubscription: Subscriptions,
  eventsStore: EventsStore
): void => {
  initWebsockets(httpServer, eventsSubscription);

  const root = "/v2";
  app.use(`/sys`, sys);
  app.use(
    `${root}/workspaces/:workspaceId/events`,
    initEventsRoutes(eventsStore)
  );
};
export default init;
