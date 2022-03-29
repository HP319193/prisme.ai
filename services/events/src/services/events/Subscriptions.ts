import { Broker, PrismeEvent } from '@prisme.ai/broker';
import { AccessManager, SubjectType, ActionType } from '../../permissions';
import { extractObjectsByPath } from '../../utils';
import { SearchOptions } from './store';

export interface Subscriber {
  userId: string;
  apiKey?: string;
  callback: (event: PrismeEvent<any>) => void;
  accessManager: Required<AccessManager>;
  searchOptions: SearchOptions;
}

type WorkspaceId = string;

const searchFilters: {
  [k in keyof Required<SearchOptions>]: (
    event: PrismeEvent,
    opts: SearchOptions[k]
  ) => boolean;
} = {
  text: (event, value) => {
    return !value || JSON.stringify(event).includes(value);
  },
  types: (event, allowedTypes) => {
    return !allowedTypes || allowedTypes.includes(event.type);
  },
  beforeDate: (event, date) =>
    !date || new Date(event.createdAt).getTime() < new Date(date).getTime(),
  afterDate: (event, date) =>
    !date || new Date(event.createdAt).getTime() > new Date(date).getTime(),
  payloadQuery: (event, query) => {
    if (!query) {
      return true;
    }
    return Object.entries(query)
      .map(([k, v]) => extractObjectsByPath(event, k) === v)
      .every(Boolean);
  },

  // Noop
  beforeId: () => true,
  page: () => true,
  limit: () => true,
};

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
        logger.trace({ msg: 'Received event', event });
        if (!event.source.workspaceId) return true;
        const subscribers = this.subscribers[event.source.workspaceId];
        (subscribers || []).forEach(
          async ({ callback, accessManager, searchOptions }) => {
            const readable = await accessManager.can(
              ActionType.Read,
              SubjectType.Event,
              event
            );
            if (readable && this.matchSearchOptions(event, searchOptions)) {
              callback(event);
            }
          }
        );
        return true;
      },
      {
        GroupPartitions: false,
      }
    );
  }

  matchSearchOptions(data: PrismeEvent, searchOptions: SearchOptions) {
    if (!searchOptions || !Object.keys(searchOptions).length) {
      return true;
    }
    return Object.entries(searchOptions)
      .map(([k, v]) =>
        (<any>searchFilters)[k]?.apply
          ? searchFilters[k as keyof SearchOptions](data, v as any)
          : true
      )
      .every(Boolean);
  }

  async subscribe(
    workspaceId: string,
    subscriber: Omit<Subscriber, 'accessManager'>
  ): Promise<() => void> {
    if (!(workspaceId in this.subscribers)) {
      this.subscribers[workspaceId] = [];
    }

    const userAccessManager = await this.accessManager.as(
      {
        id: subscriber.userId,
      },
      subscriber.apiKey
    );

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
