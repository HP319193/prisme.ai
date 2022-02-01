import { Broker, PrismeEvent } from "@prisme.ai/broker";
import { AccessManager, SubjectType, ActionType } from "../../permissions";

export interface Subscriber {
  userId: string;
  callback: (event: PrismeEvent<any>) => void;
  accessManager: Required<AccessManager>;
}

type WorkspaceId = string;

export class Subscriptions {
  private broker: Broker;
  private subscribers: Record<WorkspaceId, Subscriber[]>;
  private accessManager: AccessManager;

  constructor(broker: Broker, accessManager: AccessManager) {
    this.broker = broker;
    this.subscribers = {};
    this.accessManager = accessManager;
  }

  start() {
    // Unpartitioned listener (for websockets : we do not know which prisme.ai-events instance holds which socket)
    this.broker.all(
      async (event, broker, { logger }) => {
        logger.trace({ msg: "Received event", event });
        if (!event.source.workspaceId) return true;
        const subscribers = this.subscribers[event.source.workspaceId];
        (subscribers || []).forEach(({ callback, accessManager }) => {
          if (accessManager.can(ActionType.Read, SubjectType.Event, event)) {
            callback(event);
          }
        });
        return true;
      },
      {
        GroupPartitions: false,
      }
    );
  }

  subscribe(
    workspaceId: string,
    subscriber: Omit<Subscriber, "accessManager">
  ): () => void {
    if (!(workspaceId in this.subscribers)) {
      this.subscribers[workspaceId] = [];
    }

    const userAccessManager = this.accessManager.as({
      id: subscriber.userId,
    });
    userAccessManager.pullRoleFromSubject(SubjectType.Workspace, workspaceId);

    this.subscribers[workspaceId].push({
      ...subscriber,
      accessManager: userAccessManager,
    });

    return () => {
      this.subscribers[workspaceId] = this.subscribers[workspaceId].filter(
        (cur) => cur.callback !== subscriber.callback
      );
    };
  }
}
