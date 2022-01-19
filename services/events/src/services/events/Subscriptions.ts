import { Broker, PrismeEvent } from "@prisme.ai/broker";

export interface Subscriber {
  userId: string;
  callback: (event: PrismeEvent<any>) => void;
}

type WorkspaceId = string;

export class Subscriptions {
  private broker: Broker;
  private subscribers: Record<WorkspaceId, Subscriber[]>;

  constructor(broker: Broker) {
    this.broker = broker;
    this.subscribers = {};
  }

  start() {
    // Unpartitioned listener (for websockets : we do not know which prisme.ai-events instance holds which socket)
    this.broker.all(
      async (event, broker, { logger }) => {
        logger.trace({ msg: "Received event", event });
        if (!event.source.workspaceId) return true;
        const subscribers = this.subscribers[event.source.workspaceId];
        (subscribers || []).forEach(({ callback }) => {
          callback(event);
        });
        return true;
      },
      {
        GroupPartitions: false,
      }
    );
  }

  subscribe(workspaceId: string, subscriber: Subscriber): () => void {
    if (!(workspaceId in this.subscribers)) {
      this.subscribers[workspaceId] = [];
    }
    this.subscribers[workspaceId].push(subscriber);

    return () => {
      this.subscribers[workspaceId] = this.subscribers[workspaceId].filter(
        (cur) => cur !== subscriber
      );
    };
  }
}
