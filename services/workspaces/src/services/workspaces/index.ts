import { WORKSPACES_STORAGE_TYPE } from "../../../config";
import { PrismeContext } from "../../api/middlewares";
import { Logger } from "../../logger";
import { broker } from "../../eda";

import WorkspacesCrud from "./crud/workspaces";
import AutomationsCrud from "./crud/automations";
import DSULStorage from "./DSULStorage";

const storage = new DSULStorage(WORKSPACES_STORAGE_TYPE);

export default (logger: Logger, ctx: PrismeContext) => {
  const moduleBroker = broker.child(ctx);

  const workspacesCrud = new WorkspacesCrud(moduleBroker, storage);

  const automationsCrud = new AutomationsCrud(
    moduleBroker,
    storage,
    workspacesCrud
  );

  return {
    createWorkspace: workspacesCrud.createWorkspace,
    getWorkspace: workspacesCrud.getWorkspace,
    getWorkspaces: workspacesCrud.getWorkspaces,
    updateWorkspace: workspacesCrud.updateWorkspace,
    deleteWorkspace: workspacesCrud.deleteWorkspace,
    createAutomation: automationsCrud.createAutomation,
    getAutomation: automationsCrud.getAutomation,
    updateAutomation: automationsCrud.updateAutomation,
    deleteAutomation: automationsCrud.deleteAutomation,
  };
};
