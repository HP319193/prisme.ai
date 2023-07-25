import { Broker, PrismeEvent } from '@prisme.ai/broker';
import { Cache } from '../../cache';
import { EventType } from '../../eda';
import { AccessManager, SubjectType, ActionType } from '../../permissions';
import { extractObjectsByPath } from '../../utils';
import { SearchOptions } from './store';
import { getWorkspaceUser, WorkspaceUser } from './users';

export type Subscriber = WorkspaceUser & {
  apiKey?: string;
  socketId?: string;
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
        if (
          typeof found !== 'string' ||
          typeof expected !== 'string' ||
          (expected[expected.length - 1] !== '*' && expected[0] !== '*')
        ) {
          return found === expected;
        }
        // Only support beginning OR ending wildcard for the moment
        return expected[0] === '*'
          ? found.endsWith(expected.slice(1))
          : found.startsWith(expected.slice(0, -1));
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
    // Unpartitioned listener (for websockets & topics subscriptions : we do not know which prisme.ai-events instance holds which socket)
    this.broker.all(
      async (event, broker, { logger }) => {
        logger.trace({ msg: 'Received event', event });
        if (!event.source.workspaceId) return true;
        const subscribers =
          this.subscribers[event.source.workspaceId]?.all || [];
        (subscribers || []).forEach(
          async ({ callback, accessManager, searchOptions, socketId }) => {
            const readable = await accessManager.can(
              ActionType.Read,
              SubjectType.Event,
              event
            );
            if (
              readable &&
              (!searchOptions ||
                this.matchSearchOptions(event, searchOptions, socketId))
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

    // Update all active websockets with new subscriptions
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
          : (<any>event.payload).userIds || [];
        const topicName = event.payload.topic;
        if (!topicName) {
          return true;
        }
        await Promise.all(
          userIds.map(async (userId) => {
            const activeSubscriptions =
              this.subscribers[workspaceId]?.userIds[userId] || [];
            activeSubscriptions.forEach(async ({ accessManager }) => {
              const workspaceUser = {
                ...accessManager.user,
                topics: [
                  ...new Set(
                    (accessManager.user.topics || []).concat([topicName])
                  ),
                ],
              };
              accessManager.user = workspaceUser;
              accessManager.updatePermissions(workspaceUser);
            });
          })
        );

        return true;
      },
      {
        GroupPartitions: false,
      }
    );

    // Persist userTopics subscriptions in cache
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
          : (<any>event.payload).userIds || [];
        const topicName = event.payload.topic;
        if (!topicName) {
          return true;
        }
        await Promise.all(
          userIds.map(async (userId) => {
            const result = await this.cache.joinUserTopic(
              workspaceId,
              userId,
              topicName
            );
            return result;
          })
        );

        return true;
      }
    );
  }

  matchSearchOptions(
    data: PrismeEvent,
    searchOptions: SearchOptions,
    socketId?: string
  ) {
    if (!searchOptions || !Object.keys(searchOptions).length) {
      return true;
    }
    const sessionListener = Array.isArray(searchOptions['payloadQuery'])
      ? searchOptions['payloadQuery'].find((cur) => cur['source.sessionId'])
      : 'source.sessionId' in (searchOptions?.['payloadQuery'] || {}) &&
        searchOptions?.['payloadQuery'];
    // By default, events coming from a socket are not sent to others sockets listening to the same session
    // Disable this behaviour if the event has another target (i.e userTopic)
    const currentSocketOnly =
      data?.target?.currentSocket === true ||
      Object.keys(data?.target || {}).length == 0;
    if (
      sessionListener &&
      !('source.socketId' in sessionListener) &&
      data?.source?.socketId &&
      currentSocketOnly &&
      data?.source?.socketId !== socketId
    ) {
      return false; // Do not send
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
