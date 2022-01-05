import { v4 as uuidv4 } from "uuid";
import { Broker } from "@prisme.ai/broker";
import { EventType } from "../../../eda";
import Workspaces from "./workspaces";
import DSULStorage from "../DSULStorage";
import { ObjectNotFoundError } from "../../../errors";

class Automations {
  private broker: Broker;
  private storage: DSULStorage;
  private workspaces: Workspaces;

  constructor(broker: Broker, storage: DSULStorage, workspaces: Workspaces) {
    this.broker = broker;
    this.storage = storage;
    this.workspaces = workspaces;
  }

  createAutomation = async (
    workspaceId: string,
    automation: Prismeai.Automation
  ) => {
    automation.id = uuidv4();
    const workspace = await this.workspaces.getWorkspace(workspaceId);

    const updatedWorkspace = this.addOrReplaceAutomation(workspace, automation);

    await this.workspaces.updateWorkspace(workspaceId, updatedWorkspace);

    this.broker
      .send<Prismeai.CreatedAutomation["payload"]>(
        EventType.CreatedAutomation,
        {
          automation,
        }
      )
      .catch(console.error);
    return automation;
  };

  getAutomation = async (workspaceId: string, automationId: string) => {
    const workspace = await this.storage.get(workspaceId);
    const automation = (workspace.automations || []).find(
      (cur) => cur.id === automationId
    );
    if (!automation) {
      throw new ObjectNotFoundError(
        `Could not find automation '${automationId}'`,
        { workspaceId, automationId }
      );
    }

    return automation;
  };

  updateAutomation = async (
    workspaceId: string,
    automationId: string,
    automation: Prismeai.Automation
  ) => {
    const workspace = await this.storage.get(workspaceId);
    const updatedWorkspace = this.addOrReplaceAutomation(workspace, {
      ...automation,
      id: automationId,
    });
    if (
      updatedWorkspace.automations?.length !== workspace.automations?.length
    ) {
      throw new ObjectNotFoundError(
        `Could not find automation '${automationId}'`,
        { workspaceId, automationId }
      );
    }
    automation.id = automationId;
    await this.workspaces.updateWorkspace(workspaceId, updatedWorkspace);

    this.broker.send<Prismeai.UpdatedAutomation["payload"]>(
      EventType.UpdatedAutomation,
      {
        automation,
      }
    );
    return { ...automation };
  };

  private addOrReplaceAutomation = (
    workspace: Prismeai.Workspace,
    automation: Prismeai.Automation
  ) => {
    const newAutomations = (workspace.automations || [])
      .filter((cur) => cur.id !== automation.id)
      .concat([automation]);

    return {
      ...workspace,
      automations: newAutomations,
    };
  };

  deleteAutomation = async (
    workspaceId: string,
    automationId: PrismeaiAPI.DeleteAutomation.PathParameters["automationId"]
  ) => {
    const workspace = await this.storage.get(workspaceId);

    const updatedWorkspace = {
      ...workspace,
      automations: (workspace.automations || []).filter(
        (cur) => cur.id !== automationId
      ),
    };

    if (
      updatedWorkspace.automations?.length === workspace.automations?.length
    ) {
      throw new ObjectNotFoundError(
        `Could not find automation '${automationId}'`,
        { workspaceId, automationId }
      );
    }

    await this.storage.save(workspaceId, updatedWorkspace);

    this.broker.send<Prismeai.DeletedAutomation["payload"]>(
      EventType.DeletedAutomation,
      {
        automation: {
          id: automationId,
          name: workspace.name,
        },
      }
    );
    return { id: automationId };
  };
}

export default Automations;
