import { WORKSPACES_STORAGE_TYPE } from "../../../config";
import { PrismeContext } from "../../api/middlewares";
import { Logger } from "../../logger";
import { broker } from "../../eda";

import * as crud from "./crud";
import DSULStorage from "./DSULStorage";

const storage = new DSULStorage(WORKSPACES_STORAGE_TYPE);

export default (logger: Logger, ctx: PrismeContext) => {
  const moduleLogger = logger.child({ module: "workspaces" });
  const moduleBroker = broker.child(ctx);
  return {
    createWorkspace: crud.createWorkspace(
      moduleLogger,
      moduleBroker,
      ctx,
      storage
    ),
    getWorkspace: crud.getWorkspace(moduleLogger, ctx, storage),
    getWorkspaces: crud.getWorkspaces(moduleLogger, ctx, storage),
    updateWorkspace: crud.updateWorkspace(
      moduleLogger,
      moduleBroker,
      ctx,
      storage
    ),
    deleteWorkspace: crud.deleteWorkspace(
      moduleLogger,
      moduleBroker,
      ctx,
      storage
    ),
  };
};
