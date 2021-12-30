import { PrismeContext } from "../../api/middlewares";
import { Logger } from "../../logger";
import { Storage } from "../../storage/types";

export const createWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: Storage) =>
  async (workspace: Prismeai.Workspace) => {
    logger.debug(`Saving worksppace ${workspace.id}`);
    // TODO How to handle new workspace creation without an id yet ?
    // Create a new id, check if it exists
    const result = await storage.save(workspace.id || "", workspace);
    if (result.error) {
      // throw error how ?
    }
    return { ...workspace };
  };

export const getWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: Storage) =>
  async (workspaceId: string) => {
    logger.debug(`Retrieving worksppace ${workspaceId}`);
    return await storage.get(workspaceId);
  };

// Not implemented yet, awaiting authentification to check workspaces ownership
export const getWorkspaces =
  (logger: Logger, ctx: PrismeContext, storage: Storage) =>
  async (query: PrismeaiAPI.GetWorkspaces.QueryParameters) => {
    logger.debug("Some logs from getWorkspaces");
    return [];
  };

export const updateWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: Storage) =>
  async (workspace: Prismeai.Workspace) => {
    logger.debug(`Saving worksppace ${workspace.id}`);
    const result = await storage.save(workspace.id || "", workspace);
    if (result.error) {
      // throw error how ?
    }
    return { ...workspace };
  };

export const deleteWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: Storage) =>
  async (
    workspaceId: PrismeaiAPI.DeleteWorkspace.PathParameters["workspaceId"]
  ) => {
    await storage.delete(workspaceId);
    return { id: workspaceId };
  };
