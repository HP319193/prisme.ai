import { PrismeContext } from "../../api/middlewares";
import { Logger } from "../../logger";
import { IStorage } from "../../storage/types";
import { v4 as uuidv4 } from "uuid";

export const createWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: IStorage) =>
  async (workspace: Prismeai.Workspace) => {
    await storage.save(uuidv4(), workspace);
    return workspace;
  };

export const getWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: IStorage) =>
  async (workspaceId: string) => {
    const workspace = await storage.get(workspaceId);
    if (!workspace) {
      return;
    }
    return workspace;
  };

// Not implemented yet, awaiting authentification to check workspaces ownership
export const getWorkspaces =
  (logger: Logger, ctx: PrismeContext, storage: IStorage) =>
  async (query: PrismeaiAPI.GetWorkspaces.QueryParameters) => {
    logger.debug("Some logs from getWorkspaces");
    return [];
  };

export const updateWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: IStorage) =>
  async (workspace: Prismeai.Workspace) => {
    await storage.save(workspace.id || "", workspace);
    return { ...workspace };
  };

export const deleteWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: IStorage) =>
  async (
    workspaceId: PrismeaiAPI.DeleteWorkspace.PathParameters["workspaceId"]
  ) => {
    await storage.delete(workspaceId);
    return { id: workspaceId };
  };
