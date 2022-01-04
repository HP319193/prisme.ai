import { Application } from "express";
import Runtime from "../../services/runtime";

import sys from "./sys";
import webhooks from "./webhooks";

export const init = (app: Application, runtime: Runtime): void => {
  const root = "/v2";
  app.use(`/sys`, sys);
  app.use(`${root}/workspaces/:workspaceId/webhooks`, webhooks(runtime));
};
export default init;
