import {PrismeContext} from "../../api/middlewares";
import {Logger} from "../../logger";
import {Storage} from "../../storage/types";

export const createWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: Storage) =>
    async (workspace: Prismeai.Workspace) => {
      logger.info(`Saving worksppace ${workspace.id}`);
      // TODO How to handle new workspace creation without an id yet ?
      // Create a new id, check if it exists
      const result = await storage.save(workspace.id || "", workspace);
      if (result.error) {
        // throw error how ?
      }
      logger.info(`Save successfull for workspace ${workspace.id}`);
      return {...workspace};
    };

export const getWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: Storage) => async (workspaceId: string) => {
    logger.info(`Retrieving worksppace ${workspaceId}`);
    return await storage.get(workspaceId);
  }

// Not implemented yet, awaiting authentification to check workspaces ownership
export const getWorkspaces =
  (logger: Logger, ctx: PrismeContext, storage: Storage) =>
    async (query: PrismeaiAPI.GetWorkspaces.QueryParameters) => {
      logger.info("Some logs from getWorkspaces");
      return [];
    };

export const deleteWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: Storage) =>
    async (workspaceId: PrismeaiAPI.DeleteWorkspace.PathParameters["workspaceId"]) => {
      logger.info("Some logs from deleteWorkspaces");
      await storage.delete(workspaceId);
      return workspaceId;
    };
