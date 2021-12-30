import { PrismeContext } from "../../api/middlewares";
import { Logger } from "../../logger";
import Storage from "../../storage";

import * as crud from "./crud";

const storage = new Storage();

export default (logger: Logger, ctx: PrismeContext) => {
  const moduleLogger = logger.child({ module: "workspaces" });
  return {
    createWorkspace: crud.createWorkspace(moduleLogger, ctx, storage),
    getWorkspace: crud.getWorkspace(moduleLogger, ctx, storage),
    getWorkspaces: crud.getWorkspaces(moduleLogger, ctx, storage),
    updateWorkspace: crud.updateWorkspace(moduleLogger, ctx, storage),
    deleteWorkspace: crud.deleteWorkspace(moduleLogger, ctx, storage),
  };
};
