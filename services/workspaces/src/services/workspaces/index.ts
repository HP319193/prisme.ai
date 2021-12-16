import { PrismeContext } from "../../api/middlewares";
import { Logger } from "../../logger";

import * as crud from "./crud";

export default (logger: Logger, ctx: PrismeContext) => {
  const moduleLogger = logger.child({ module: "workspaces" });
  return {
    createWorkspace: crud.createWorkspace(moduleLogger, ctx),
    getWorkspace: crud.getWorkspace(moduleLogger, ctx),
    getWorkspaces: crud.getWorkspaces(moduleLogger, ctx),
  };
};
