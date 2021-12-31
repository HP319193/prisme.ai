import { Application } from "express";

import sys from "./sys";
import webhooks from "./webhooks";

export const init = (app: Application): void => {
  const root = "/v2";
  app.use(`/sys`, sys);
  app.use(`${root}/workspaces/:workspaceId/webhooks`, webhooks);
};
export default init;
