import { Broker } from "@prisme.ai/broker";
import { EventType } from "../../eda";
import { ObjectNotFoundError } from "../../errors";
import { Workspace } from "./workspace";

export * from "./workspace";

export class Workspaces {
  private broker: Broker;
  private workspaces: Record<string, Workspace>;

  constructor(broker: Broker) {
    this.workspaces = {
      foo: new Workspace({
        name: "25",
        automations: {
          myAutomate: {
            id: "myAutomateId",
            triggers: {
              myTrigger: {
                events: ["event1"],
                dates: ["date1"],
                endpoint: "true",
                do: "premier",
              },
            },
            workflows: {
              premier: {
                do: [
                  {
                    deuxieme: {
                      biscuit: "maison",
                    },
                  },
                ],
              },
            },
          },

          mySecondAutomate: {
            id: "mySecondAutomateId",
            triggers: {
              eventTrigger: {
                events: ["apps.someApp.someEvent"],
                do: "processSomeEvent",
              },
            },
            workflows: {
              deuxieme: {
                do: [
                  {
                    troisieme: {
                      ferrero: "rocher",
                    },
                  },
                ],
              },

              troisieme: {
                do: [
                  {
                    emit: {
                      event: "apps.someApp.someEvent",
                      payload: {
                        contenu: "de la payload",
                      },
                    },
                  },
                ],
              },

              processSomeEvent: {
                do: [{ "un workflow inexistant": {} }],
              },
            },
          },

          infiniteLoop: {
            id: "infiniteLoopId",
            triggers: {
              infiniteLoop: {
                endpoint: "loop",
                do: "debutLoop",
              },
            },
            workflows: {
              debutLoop: {
                do: [
                  {
                    "fin loop": {
                      foo: "bar",
                    },
                  },
                ],
              },
              "fin loop": {
                do: [
                  {
                    debutLoop: {
                      foo: "bar",
                    },
                  },
                ],
              },
            },
          },
        },
      }),
    };
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
      throw new ObjectNotFoundError("Workspace not found", { workspaceId });
    }
    return this.workspaces[workspaceId];
  }
}
