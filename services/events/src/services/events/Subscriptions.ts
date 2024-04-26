import { Broker, PrismeEvent } from '@prisme.ai/broker';
import { Cache, WorkspaceSubscriber } from '../../cache';
import { EventType } from '../../eda';
import { AccessManager, SubjectType, ActionType } from '../../permissions';
import { extractObjectsByPath } from '../../utils';
import { SearchOptions } from './store';
import { getWorkspaceUser } from './users';
import { Permissions, Rules } from '@prisme.ai/permissions';
import { logger } from '../../logger';
import { Readable } from 'stream';

export type Subscriber = Omit<WorkspaceSubscriber, 'permissions'> & {
  permissions: Permissions<SubjectType>;
  unsubscribe?: () => void;
  local?: boolean; // If true, means the corresponding socket is connected to current instance
  oldSocketId?: string; // When reconnecting to a previous socketId, Joined event sets oldSocketId to the temporary & new socketId & socketId to the reconnected previous socketId
};

export type LocalSubscriber = Omit<Subscriber, 'local' | 'unsubscribe'> &
  Required<Pick<Subscriber, 'local' | 'unsubscribe' | 'permissions'>>;

type WorkspaceId = string;
type UserId = string;

const searchFilters: {
  [k in keyof Required<SearchOptions>]: (
    event: PrismeEvent,
    opts: SearchOptions[k],
    ctx: { socketId?: string }
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
  payloadQuery: function matchQuery(
    event,
    query,
    ctx?: { socketId?: string }
  ): boolean {
    if (!query) {
      return true;
    }
    if (Array.isArray(query)) {
      return query.some((query) => matchQuery(event, query, ctx));
    }
    const { currentSocket: currentSocketOnly = true } = event?.target || {};
    // By default, events coming from a socket are not sent to others sockets listening to the same session
    if (
      'source.sessionId' in query &&
      !('source.socketId' in query) &&
      ctx?.socketId &&
      event?.source?.socketId &&
      currentSocketOnly &&
      event?.source?.socketId !== ctx?.socketId
    ) {
      return false; // Do not send
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
export class Subscriptions extends Readable {
  public broker: Broker;
  public accessManager: AccessManager;
  private subscribers: Record<WorkspaceId, WorkspaceSubscribers>;
  private cache: Cache;

  constructor(broker: Broker, accessManager: AccessManager, cache: Cache) {
    super({ objectMode: true });
    this.broker = broker;
    this.subscribers = {};
    this.accessManager = accessManager;
    this.cache = cache;
  }

  _read(): void {
    return;
  }

  async initSubscribersFromCache() {
    // Start subscribers cache synchronisation
    this.broker.on<
      | Prismeai.JoinedWorkspaceSubscriber['payload']
      | Prismeai.LeftWorkspaceSubscriber['payload']
    >(
      [EventType.JoinedWorkspaceSubscriber, EventType.LeftWorkspaceSubscriber],
      (event) => {
        const workspaceId = event.payload?.workspaceId!;
        const userId = event.payload?.userId!;
        const socketId = event.payload?.socketId!;

        if (event.type === EventType.JoinedWorkspaceSubscriber) {
          const joined =
            event.payload as any as Prismeai.JoinedWorkspaceSubscriber['payload'];
          const existingSubscriber = (
            this.subscribers?.[workspaceId]?.userIds?.[userId] || []
          ).find(
            (cur) =>
              // If this event has been emitted by current instance, the Subscriber socketId has already been updated, so we must check existing subscribers with both socketId & oldSocketId
              cur.socketId === joined.socketId ||
              (joined.oldSocketId && cur.socketId === joined.oldSocketId)
          );
          if (existingSubscriber && existingSubscriber.local) {
            // Igore events from local subscriptions as they have been updated in first place
            return true;
          }

          if (existingSubscriber) {
            logger.debug({
              msg: 'Update existing subscriber',
              workspaceId,
              userId,
              socketId: existingSubscriber.socketId,
              newSocketId: joined.socketId,
              filters: joined.filters,
            });
            Object.assign(existingSubscriber, {
              socketId: joined.socketId,
              filters: joined.filters,
              permissions: Permissions.buildFrom(joined.permissions),
            });
          } else {
            // New subscriber
            logger.debug({
              msg: 'Adding new subscriber',
              workspaceId,
              userId,
              socketId,
              filters: joined.filters,
            });
            const subscriber: Subscriber = {
              ...joined,
              permissions: Permissions.buildFrom(joined.permissions),
            };
            this.addSubscriber(subscriber);
          }
        } else if (event.type === EventType.LeftWorkspaceSubscriber) {
          logger.debug({
            msg: 'Removing subscriber',
            workspaceId,
            userId,
            socketId,
          });
          const left =
            event.payload as any as Prismeai.LeftWorkspaceSubscriber['payload'];
          this.unregisterSubscriber(left);
        }
        return true;
      },
      {
        GroupPartitions: false,
      }
    );

    // Now that our event based synchronization is ready, pull all existing subscribers from cache
    let totalSubscribersRestored = 0;
    const cachedSubscribers = await this.cache.getAllWorkspaceSubscribers();
    for (let [workspaceId, wkSubscribers] of Object.entries(
      cachedSubscribers
    )) {
      const subscribers: Subscriber[] = wkSubscribers.map((cur) => {
        const subscriber: Subscriber = {
          ...cur,
          workspaceId,
          permissions: Permissions.buildFrom(cur.permissions),
        };

        return subscriber;
      });

      for (let subscriber of subscribers) {
        if (this.addSubscriber(subscriber)) {
          totalSubscribersRestored += 1;
        }
      }
    }
    logger.info({
      msg: `Retrieved ${totalSubscribersRestored} subscribers accross ${
        Object.keys(this.subscribers).length
      } workspaces from cache.`,
    });
  }

  async start(callback: (subscriber: Subscriber, event: PrismeEvent) => void) {
    // Listen to events, find matching subscribers & pass to listener callback for websocket transmission
    this.on('data', (event) => {
      const subscribers = this.subscribers[event.source.workspaceId]?.all || [];
      (subscribers || []).forEach(async (subscriber) => {
        const { permissions, filters, socketId } = subscriber;
        // Test search filters first to avoid casl overhead if the event is not listened anyway
        if (!filters || this.matchSearchFilters(event, filters, socketId)) {
          const readable = permissions.can(
            ActionType.Read,
            SubjectType.Event,
            event
          );
          if (readable) {
            callback(subscriber, event);
          }
        }
      });
    });

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

            // Update permissions from corresponding subscribers & emit to the rest of the cluster
            const activeSubscribers =
              this.subscribers[workspaceId]?.userIds?.[userId] || [];
            await Promise.all(
              activeSubscribers.map((subscriber) => {
                const rules = subscriber.permissions?.ability?.rules || [];
                let topicAlreadyAllowed = false;
                //  For each subscriber, start to find permissions rules matching userTopics
                const userTopicRules = rules.filter((cur) => {
                  if (!cur?.conditions?.['target.userTopic']) {
                    return false;
                  }
                  if (
                    Array.isArray(cur.action) &&
                    !cur.action.includes('read')
                  ) {
                    return false;
                  }
                  if (typeof cur.action === 'string' && cur.action !== 'read') {
                    return false;
                  }
                  if (
                    Array.isArray(cur.subject) &&
                    !cur.subject.includes('events')
                  ) {
                    return false;
                  }
                  if (
                    typeof cur.subject === 'string' &&
                    cur.subject !== 'events'
                  ) {
                    return false;
                  }
                  const currentTopics =
                    (cur?.conditions?.['target.userTopic'] as any)?.['$in'] ||
                    cur?.conditions?.['target.userTopic'];
                  if (
                    currentTopics === topicName ||
                    (Array.isArray(currentTopics) &&
                      currentTopics.includes(topicName))
                  ) {
                    topicAlreadyAllowed = true;
                  }
                  return Array.isArray(currentTopics);
                });

                if (topicAlreadyAllowed) {
                  return;
                }

                // Update permissions rules
                if (!userTopicRules?.length) {
                  // This subscriber didn't have any userTopic allowed ; create the corresponding rule
                  rules.push({
                    action: ['read'],
                    subject: 'events',
                    conditions: {
                      'target.userTopic': {
                        $in: [topicName],
                      },
                    },
                  });
                } else {
                  userTopicRules.forEach((cur) => {
                    const currentTopics: string[] =
                      (cur?.conditions?.['target.userTopic'] as any)?.['$in'] ||
                      cur?.conditions?.['target.userTopic'];
                    cur.conditions = {
                      ...cur.conditions,
                      'target.userTopic': {
                        $in: Array.isArray(currentTopics)
                          ? currentTopics.concat([topicName])
                          : [topicName],
                      },
                    };
                  });
                }

                // Rebuild permissions & emit
                subscriber.permissions = Permissions.buildFrom(rules);
                this.registerSubscriber(subscriber);
              })
            );
            return result;
          })
        );

        return true;
      }
    );
  }

  matchSearchFilters(
    data: PrismeEvent,
    filters: SearchOptions,
    socketId?: string
  ) {
    if (!filters || !Object.keys(filters).length) {
      return true;
    }

    return Object.entries(filters)
      .map(([k, v]) =>
        (<any>searchFilters)[k]?.apply
          ? searchFilters[k as keyof SearchOptions](data, v as any, {
              socketId,
            })
          : true
      )
      .every(Boolean);
  }

  async subscribe(
    workspaceId: string,
    subscriber: {
      workspaceId: string;
      userId: string;
      sessionId: string;
      socketId: string;
      apiKey?: string;
      authData: any;
    } & Pick<Subscriber, 'filters'>
  ): Promise<LocalSubscriber> {
    const workspaceUser = await getWorkspaceUser(
      workspaceId,
      {
        id: subscriber.userId,
        sessionId: subscriber.sessionId,
      },
      this.cache
    );
    const userAccessManager = await this.accessManager.as(
      workspaceUser,
      subscriber.apiKey
    );

    await userAccessManager.pullRoleFromSubject(
      SubjectType.Workspace,
      workspaceId
    );

    // Small performance improvement : reduce casl overhead by removing all others rules
    const userPermissions = (<any>userAccessManager)
      .permissions as Permissions<any>;
    const filteredRules = userPermissions.ability.rules.filter(
      (cur) =>
        cur.subject === SubjectType.Event ||
        (Array.isArray(cur.subject) && cur.subject.includes(SubjectType.Event))
    ) as Rules;
    userPermissions.updateRules(filteredRules);

    const fullSubscriber = {
      ...subscriber,
      ...workspaceUser,
      accessManager: userAccessManager,
      permissions: userPermissions,
      unsubscribe: () => {
        this.unregisterSubscriber(fullSubscriber, true);
      },
      local: true,
    };
    this.addSubscriber(fullSubscriber);
    this.registerSubscriber(fullSubscriber);

    return fullSubscriber;
  }

  private addSubscriber(subscriber: Subscriber) {
    if (!(subscriber.workspaceId in this.subscribers)) {
      this.subscribers[subscriber.workspaceId] = {
        all: [],
        userIds: {},
      };
    }

    if (
      !(subscriber.userId in this.subscribers[subscriber.workspaceId].userIds)
    ) {
      this.subscribers[subscriber.workspaceId].userIds[subscriber.userId] = [];
    }

    // First check if this subscriber already exists to keep it updated without pushing it twice
    const existingSocketId = subscriber.oldSocketId || subscriber.socketId;
    const existingSubscriber = this.subscribers[subscriber.workspaceId].userIds[
      subscriber.userId
    ].find((cur) => cur.socketId === existingSocketId);
    if (!existingSubscriber) {
      this.subscribers[subscriber.workspaceId].all.push(subscriber);
      this.subscribers[subscriber.workspaceId].userIds[subscriber.userId].push(
        subscriber
      );
      return true;
    }
    return false;
  }

  // Declare the new or updated Subscriber to the rest of the cluster
  private async registerSubscriber(subscriber: Subscriber) {
    const publishedSubscriber: WorkspaceSubscriber = {
      workspaceId: subscriber.workspaceId,
      userId: subscriber.userId,
      sessionId: subscriber.sessionId,
      socketId: subscriber.socketId,
      filters: subscriber.filters,
      permissions: subscriber.permissions.ability.rules,
      oldSocketId: subscriber.oldSocketId,
    };

    // So we can know later on if this user can reuse this socketId for contexts persistence throughout disconnections
    this.cache
      .registerSocketId(
        subscriber.workspaceId,
        subscriber.sessionId,
        subscriber.socketId
      )
      .catch(logger.error);

    // So future prismeai-events instances know when to emit events to this subscriber
    this.cache
      .registerSubscriber(
        subscriber.workspaceId,
        subscriber.sessionId,
        subscriber.socketId,
        publishedSubscriber
      )
      .catch(logger.error);

    // So current prismeai-events instances know when to emit events to this subscriber
    this.broker
      .send<Prismeai.JoinedWorkspaceSubscriber['payload']>(
        EventType.JoinedWorkspaceSubscriber,
        publishedSubscriber as Prismeai.JoinedWorkspaceSubscriber['payload'],
        {},
        {
          options: {
            persist: false,
          },
        },
        {
          // This emit must not fail, which it could easily do because of nested objects validation by express-openapi
          disableValidation: true,
        }
      )
      .catch(logger.error);

    // Finally, clear subscriber from previous socketId if we just changed it
    if (subscriber.oldSocketId) {
      this.cache
        .unregisterSubscriber(
          subscriber.workspaceId,
          subscriber.sessionId,
          subscriber.oldSocketId
        )
        .catch(logger.error);
    }
  }

  async unregisterSubscriber(
    subscriber: Omit<Subscriber, 'permissions'>,
    emit?: boolean
  ) {
    if (!(subscriber.workspaceId in this.subscribers)) {
      this.subscribers[subscriber.workspaceId] = {
        all: [],
        userIds: {},
      };
    }
    if (
      !(subscriber.userId in this.subscribers[subscriber.workspaceId].userIds)
    ) {
      this.subscribers[subscriber.workspaceId].userIds[subscriber.userId] = [];
    }

    this.subscribers[subscriber.workspaceId].all = this.subscribers[
      subscriber.workspaceId
    ].all.filter((cur) => cur.socketId !== subscriber.socketId);
    this.subscribers[subscriber.workspaceId].userIds[subscriber.userId] =
      this.subscribers[subscriber.workspaceId].userIds[
        subscriber.userId
      ].filter((cur) => cur.socketId !== subscriber.socketId);

    if (!emit) {
      return;
    }

    this.broker
      .send<Prismeai.LeftWorkspaceSubscriber['payload']>(
        EventType.LeftWorkspaceSubscriber,
        {
          workspaceId: subscriber.workspaceId,
          userId: subscriber.userId,
          sessionId: subscriber.sessionId,
          socketId: subscriber.socketId,
        },
        {},
        {
          options: {
            persist: false,
          },
        },
        {
          disableValidation: true,
        }
      )
      .catch(logger.error);

    this.cache
      .unregisterSubscriber(
        subscriber.workspaceId,
        subscriber.sessionId,
        subscriber.socketId
      )
      .catch(logger.error);
  }

  async updateLocalSubscriber(
    subscriber: LocalSubscriber,
    update: { socketId?: string; filters?: any }
  ) {
    if (update?.socketId) {
      // Allow keeping same socketIds accross reconnection
      // in order to make runtime socket context persistent through reconnections
      const allowed = await this.cache.isKnownSocketId(
        subscriber.workspaceId,
        subscriber.sessionId as string,
        update.socketId
      );
      if (!allowed) {
        return false;
      }
    }

    if (update?.filters) {
      subscriber.filters = update.filters;
    } else if (update?.socketId) {
      subscriber.oldSocketId = subscriber.socketId;
      subscriber.socketId = update.socketId;
    }

    this.registerSubscriber(subscriber);

    return true;
  }
}
