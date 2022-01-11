import { nanoid } from "nanoid";
import { Broker } from "@prisme.ai/broker";
import { EventType } from "../../../eda";
import DSULStorage from "../DSULStorage";

class Workspaces {
  private broker: Broker;
  private storage: DSULStorage;

  constructor(broker: Broker, storage: DSULStorage) {
    this.broker = broker;
    this.storage = storage;
  }

  createWorkspace = async (workspace: Prismeai.Workspace) => {
    await this.storage.save(nanoid(7), workspace);
    this.broker.send<Prismeai.CreatedWorkspace["payload"]>(
      EventType.CreatedWorkspace,
      {
        workspace,
      }
    );
    return workspace;
  };

  getWorkspace = async (workspaceId: string) => {
    return await this.storage.get(workspaceId);
  };

  // Not implemented yet, awaiting authentification to check workspaces ownership
  getWorkspaces = async (query: PrismeaiAPI.GetWorkspaces.QueryParameters) => {
    return this.storage.list();
  };

  updateWorkspace = async (
    workspaceId: string,
    workspace: Prismeai.Workspace
  ) => {
    await this.getWorkspace(workspaceId);
    await this.storage.save(workspaceId, workspace);
    this.broker.send<Prismeai.UpdatedWorkspace["payload"]>(
      EventType.UpdatedWorkspace,
      {
        workspace,
      }
    );
    return { ...workspace };
  };

  deleteWorkspace = async (
    workspaceId: PrismeaiAPI.DeleteWorkspace.PathParameters["workspaceId"]
  ) => {
    await this.getWorkspace(workspaceId);
    await this.storage.delete(workspaceId);
    this.broker.send<Prismeai.DeletedWorkspace["payload"]>(
      EventType.DeletedWorkspace,
      {
        workspaceId,
      }
    );
    return { id: workspaceId };
  };
}

export default Workspaces;
