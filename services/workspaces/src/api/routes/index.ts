import { Application } from "express";

import sys from "./sys";
import workspaces from "./workspaces";
import events from "./events";

export const init = (app: Application): void => {
  const root = "/v2";
  app.use(`${root}/sys`, sys);
  app.use(`${root}/workspaces`, workspaces);
  app.use(`${root}/workspaces/:workspaceId/events`, events);
};
export default init;
