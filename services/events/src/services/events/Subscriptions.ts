import { Broker, PrismeEvent } from '@prisme.ai/broker';
import { Cache } from '../../cache';
import { EventType } from '../../eda';
import { AccessManager, SubjectType, ActionType } from '../../permissions';
import { extractObjectsByPath } from '../../utils';
import { SearchOptions } from './store';
import { getWorkspaceUser, WorkspaceUser } from './users';

export type Subscriber = WorkspaceUser & {
  apiKey?: string;
  callback: (event: PrismeEvent<any>) => void;
  accessManager: Required<AccessManager>;
  searchOptions?: SearchOptions;
  unsubscribe: () => void;
};

type WorkspaceId = string;
type UserId = string;

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
  appInstanceDepth: (event, depth) =>
    typeof depth === 'number' && event.source?.appInstanceDepth
      ? event.source?.appInstanceDepth <= depth
      : true,
  payloadQuery: function matchQuery(event, query): boolean {
    if (!query) {
      return true;
    }
    if (Array.isArray(query)) {
      return query.some((query) => matchQuery(event, query));
    }
    return Object.entries(query)
      .map(([k, expected]) => {
        const found = extractObjectsByPath(event, k);
        if (Array.isArray(expected)) {
          return expected.includes(found);
        }
        if (!expected) {
          return !found;
        }
        return found === expected;
      })
      .every(Boolean);
  },

  // Noop
  beforeId: () => true,
  page: () => true,
  limit: () => true,
  sort: () => true,
};

type WorkspaceSubscribers = {
  all: Subscriber[];
  userIds: Record<UserId, Subscriber[]>;
};
export class Subscriptions {
  public broker: Broker;
  public accessManager: AccessManager;
  private subscribers: Record<WorkspaceId, WorkspaceSubscribers>;
  private cache: Cache;

  constructor(broker: Broker, accessManager: AccessManager, cache: Cache) {
    this.broker = broker;
    this.subscribers = {};
    this.accessManager = accessManager;
    this.cache = cache;
  }

  start() {
    // Unpartitioned listener (for websockets : we do not know which prisme.ai-events instance holds which socket)
    this.broker.all(
      async (event, broker, { logger }) => {
        logger.trace({ msg: 'Received event', event });
        if (!event.source.workspaceId) return true;
        const subscribers =
          this.subscribers[event.source.workspaceId]?.all || [];
        (subscribers || []).forEach(
          async ({ callback, accessManager, searchOptions }) => {
            const readable = await accessManager.can(
              ActionType.Read,
              SubjectType.Event,
              event
            );
            if (
              readable &&
              (!searchOptions || this.matchSearchOptions(event, searchOptions))
            ) {
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

    this.broker.on<
      Prismeai.CreatedUserTopic['payload'] | Prismeai.JoinedUserTopic['payload']
    >(
      [EventType.CreatedUserTopic, EventType.JoinedUserTopic],
      async (event) => {
        if (!event?.payload) {
          return true;
        }
        const workspaceId = event?.source?.workspaceId!;

        const userIds: string[] = (<any>event.payload).user?.id
          ? [(<any>event.payload).user?.id]
          : (<any>event.payload).userIds;
        const topicName = event.payload.topic;
        await Promise.all(
          userIds.map(async (userId) => {
            const result = await this.cache.joinUserTopic(
              workspaceId,
              userId,
              topicName
            );
            const activeSubscriptions =
              this.subscribers[workspaceId]?.userIds[userId] || [];
            activeSubscriptions.forEach(
              async ({ sessionId, accessManager }) => {
                const workspaceUser = await getWorkspaceUser(
                  workspaceId,
                  {
                    id: userId,
                    sessionId,
                  },
                  this.cache
                );
                accessManager.updatePermissions(workspaceUser);
              }
            );
            return result;
          })
        );

        return true;
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
    subscriber: Omit<Subscriber, 'accessManager' | 'unsubscribe' | 'topics'>
  ): Promise<Subscriber> {
    if (!(workspaceId in this.subscribers)) {
      this.subscribers[workspaceId] = {
        all: [],
        userIds: {},
      };
    }
    if (!(subscriber.id in this.subscribers[workspaceId].userIds)) {
      this.subscribers[workspaceId].userIds[subscriber.id] = [];
    }

    const workspaceUser = await getWorkspaceUser(
      workspaceId,
      {
        id: subscriber.id,
        sessionId: subscriber.sessionId,
      },
      this.cache
    );
    const userAccessManager = await this.accessManager.as(
      workspaceUser,
      subscriber.apiKey
    );

    const fullSubscriber: Subscriber = {
      ...subscriber,
      ...workspaceUser,
      accessManager: userAccessManager,
      unsubscribe: () => {
        this.subscribers[workspaceId].all = this.subscribers[
          workspaceId
        ].all.filter((cur) => cur.callback !== subscriber.callback);
        this.subscribers[workspaceId].userIds[subscriber.id] = this.subscribers[
          workspaceId
        ].userIds[subscriber.id].filter(
          (cur) => cur.callback !== subscriber.callback
        );
      },
    };
    this.subscribers[workspaceId].all.push(fullSubscriber);
    this.subscribers[workspaceId].userIds[subscriber.id].push(fullSubscriber);

    return fullSubscriber;
  }
}
