import yaml from "js-yaml";
import { Broker } from "@prisme.ai/broker";
import { EventType } from "../../eda";
import { ObjectNotFoundError } from "../../errors";
import Storage from "../../storage";
import { DriverType } from "../../storage/types";
import { Workspace } from "./workspace";

export * from "./workspace";

export class Workspaces extends Storage {
  private broker: Broker;
  private workspaces: Record<string, Workspace>;

  constructor(driverType: DriverType, broker: Broker) {
    super(driverType);
    this.workspaces = {};
    this.broker = broker;
  }

  startLiveUpdates() {
    this.broker.on<Prismeai.UpdatedAutomation["payload"]>(
      EventType.UpdatedAutomation,
      async (event, broker, { logger }) => {
        return true;
      }
    );
  }

  async getWorkspace(workspaceId: string) {
    if (!(workspaceId in this.workspaces)) {
      await this.fetchWorkspace(workspaceId);
    }
    return this.workspaces[workspaceId];
  }

  async fetchWorkspace(workspaceId: string): Promise<Prismeai.Workspace> {
    try {
      const raw = await this.driver.get(`${workspaceId}/current.yml`);
      const dsul = yaml.load(raw) as Prismeai.Workspace;
      this.workspaces[workspaceId] = new Workspace(dsul);
      return dsul;
    } catch (err) {
      if (err instanceof ObjectNotFoundError) {
        throw new ObjectNotFoundError(`Workspace not found`, { workspaceId });
      }
      throw err;
    }
  }
}
