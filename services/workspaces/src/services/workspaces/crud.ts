import { PrismeContext } from "../../api/middlewares";
import { Logger } from "../../logger";
import { IStorage } from "../../storage/types";
import { v4 as uuidv4 } from "uuid";
import { Broker } from "@prisme.ai/broker";
import { EventType } from "../../eda";

export const createWorkspace =
  (logger: Logger, broker: Broker, ctx: PrismeContext, storage: IStorage) =>
  async (workspace: Prismeai.Workspace) => {
    await storage.save(uuidv4(), workspace);
    broker.send<Prismeai.CreatedWorkspace["payload"]>(
      EventType.CreatedWorkspace,
      {
        workspace,
      }
    );
    return workspace;
  };

export const getWorkspace =
  (logger: Logger, ctx: PrismeContext, storage: IStorage) =>
  async (workspaceId: string) => {
    return await storage.get(workspaceId);
  };

// Not implemented yet, awaiting authentification to check workspaces ownership
export const getWorkspaces =
  (logger: Logger, ctx: PrismeContext, storage: IStorage) =>
  async (query: PrismeaiAPI.GetWorkspaces.QueryParameters) => {
    logger.debug("Some logs from getWorkspaces");
    return [];
  };

export const updateWorkspace =
  (logger: Logger, broker: Broker, ctx: PrismeContext, storage: IStorage) =>
  async (workspaceId: string, workspace: Prismeai.Workspace) => {
    await getWorkspace(logger, ctx, storage)(workspaceId);
    await storage.save(workspaceId, workspace);
    broker.send<Prismeai.UpdatedWorkspace["payload"]>(
      EventType.UpdatedWorkspace,
      {
        workspace,
      }
    );
    return { ...workspace };
  };

export const deleteWorkspace =
  (logger: Logger, broker: Broker, ctx: PrismeContext, storage: IStorage) =>
  async (
    workspaceId: PrismeaiAPI.DeleteWorkspace.PathParameters["workspaceId"]
  ) => {
    await getWorkspace(logger, ctx, storage)(workspaceId);
    await storage.delete(workspaceId);
    broker.send<Prismeai.DeletedWorkspace["payload"]>(
      EventType.DeletedWorkspace,
      {
        workspaceId,
      }
    );
    return { id: workspaceId };
  };
