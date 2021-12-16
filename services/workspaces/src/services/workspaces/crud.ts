import { PrismeContext } from "../../api/middlewares";
import { Logger } from "../../logger";

export const createWorkspace =
  (logger: Logger, ctx: PrismeContext) =>
  async (workspace: Prismeai.Workspace) => {
    logger.info("Some logs from createWorkspace ");
    return { ...workspace };
  };

export const getWorkspace =
  (logger: Logger, ctx: PrismeContext) => async (workspaceId: string) => {
    logger.info("Some logs from getWorkspace ");
    return { id: workspaceId, name: workspaceId };
  };

export const getWorkspaces =
  (logger: Logger, ctx: PrismeContext) =>
  async (query: PrismeaiAPI.GetWorkspaces.QueryParameters) => {
    logger.info("Some logs from getWorkspaces ");
    return [];
  };
