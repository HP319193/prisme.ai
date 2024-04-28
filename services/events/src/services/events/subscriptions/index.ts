import { Broker, PrismeEvent } from '@prisme.ai/broker';
import { Cache, WorkspaceSubscriber } from '../../../cache';
import { EventType } from '../../../eda';
import { AccessManager, SubjectType, ActionType } from '../../../permissions';
import { SearchOptions } from '../store';
import { getWorkspaceUser } from '../users';
import { Permissions, Rules } from '@prisme.ai/permissions';
import { logger } from '../../../logger';
import { Readable } from 'stream';
import { searchFilters } from './searchFilters';
import {
  LocalSubscriber,
  Subscriber,
  WorkspaceId,
  WorkspaceSubscribers,
} from './types';
import { updateSubscriberUserTopics } from './updateSubscriberUserTopics';

export * from './types';

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
        if (event.type === EventType.JoinedWorkspaceSubscriber) {
          const { oldSocketId, ...joined } =
            event.payload as any as Prismeai.JoinedWorkspaceSubscriber['payload'];
          this.saveSubscriber(
            {
              ...joined,
              permissions: Permissions.buildFrom(joined.permissions),
            },
            { oldSocketId }
          );
        } else if (event.type === EventType.LeftWorkspaceSubscriber) {
          logger.debug({
            msg: 'Removing subscriber',
            workspaceId: event.payload?.workspaceId!,
            userId: event.payload?.userId!,
            socketId: event.payload?.socketId!,
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
        // Do not update any existing subscriber already synced from events
        if (this.saveSubscriber(subscriber, { disableUpdate: true })) {
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

  async start(
    callback: (event: PrismeEvent, subscribers: Subscriber[]) => void
  ) {
    // Listen to events, find matching subscribers & pass to listener callback for websocket transmission
    this.on('data', async (event) => {
      const matchingSubscribers: Subscriber[] = [];
      let foundSocketSubscriber = event?.source?.socketId ? false : true;
      const matchSubscriber = (subscriber: Subscriber) => {
        // Test search filters first to avoid casl overhead if the event is not listened anyway
        if (
          !subscriber.filters ||
          this.matchSearchFilters(
            event,
            subscriber.filters,
            subscriber.socketId
          )
        ) {
          const readable = subscriber.permissions.can(
            ActionType.Read,
            SubjectType.Event,
            event
          );
          if (readable) {
            matchingSubscribers.push(subscriber);
          }
        }
      };

      const candidateSubscribers =
        this.subscribers[event.source.workspaceId]?.all || [];
      (candidateSubscribers || []).forEach(async (subscriber) => {
        if (!subscriber.socketId) {
          return;
        }
        if (
          event?.source?.socketId &&
          subscriber.socketId === event?.source?.socketId
        ) {
          foundSocketSubscriber = true;
        }
        matchSubscriber(subscriber);
      });

      // If we do not have any subscriber corresponding to this event socketId, this means we are late on events.subscribers.* live synchronization & need to pull from cache
      if (!foundSocketSubscriber) {
        const subscriberData = await this.cache.getWorkspaceSubscriber(
          event?.source?.workspaceId,
          event?.source?.sessionId,
          event?.source?.socketId
        );
        logger.warn({
          msg: `No subscriber matching ${event?.source?.socketId}, pulled from cache.`,
          found: !!subscriberData,
        });
        if (subscriberData) {
          const subscriber: Subscriber = {
            ...subscriberData,
            permissions: Permissions.buildFrom(subscriberData.permissions),
          };
          this.saveSubscriber(subscriber);
          matchSubscriber(subscriber);
        }
      }

      // Finally send our event & matching subscribers
      callback(event, matchingSubscribers);
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
                updateSubscriberUserTopics(subscriber, topicName);
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

  private matchSearchFilters(
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
    this.saveSubscriber(fullSubscriber);
    await this.registerSubscriber(fullSubscriber);

    return fullSubscriber;
  }

  private saveSubscriber(
    subscriber: Subscriber,
    opts?: { oldSocketId?: string; disableUpdate?: boolean }
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

    // First check if this subscriber already exists to keep it updated without pushing it twice
    const existingSubscribers = this.subscribers[
      subscriber.workspaceId
    ].userIds[subscriber.userId].filter(
      (cur) =>
        // If this event has been emitted by current instance, the Subscriber socketId has already been updated, so we must check existing subscribers with both socketId & oldSocketId
        cur.socketId === subscriber.socketId ||
        (opts?.oldSocketId && cur.socketId === opts?.oldSocketId)
    );
    if (!existingSubscribers.length) {
      this.subscribers[subscriber.workspaceId].all.push(subscriber);
      this.subscribers[subscriber.workspaceId].userIds[subscriber.userId].push(
        subscriber
      );
      logger.debug({
        msg: 'Adding new subscriber',
        workspaceId: subscriber.workspaceId,
        userId: subscriber.userId,
        socketId: subscriber.socketId,
        filters: subscriber.filters,
      });
      return true;
    }
    if (opts?.disableUpdate) {
      return false;
    }
    // Make sure we never have more than 1 subscriber with the same socketId, as it would make us sending same events multiple times to the corresponding socket
    const [existingSubscriber, ...inactiveSubscribers] = !opts?.oldSocketId
      ? existingSubscribers
      : // If we were given an oldSocketId, keep this old socket in priority so we don't remove some instance currently used by local websockets
        existingSubscribers.sort((a) =>
          a.socketId === opts?.oldSocketId ? -1 : 0
        );
    const previousSocketId =
      opts?.oldSocketId && existingSubscriber.socketId === opts?.oldSocketId
        ? opts?.oldSocketId
        : undefined;
    Object.assign(existingSubscriber, {
      socketId: subscriber.socketId,
      filters: subscriber.filters,
      permissions: subscriber.permissions,
    });
    logger.debug({
      msg: 'Update existing subscriber',
      workspaceId: existingSubscriber.workspaceId,
      userId: existingSubscriber.userId,
      socketId: existingSubscriber.socketId,
      previousSocketId,
      filters: existingSubscriber.filters,
    });

    // Drop additional subscribers from our memory
    if (inactiveSubscribers.length) {
      inactiveSubscribers.forEach((cur) => {
        // Simply unlink their socketId to avoid performance overhead of rebuilding the entire workspace + user subscribers list without these
        delete cur.socketId;
        delete cur.filters;
        delete (cur as any).permissions;
      });
    }

    return false;
  }

  // Declare the new or updated Subscriber to the rest of the cluster
  private async registerSubscriber(
    subscriber: Subscriber,
    oldSocketId?: string
  ) {
    const publishedSubscriber: WorkspaceSubscriber = {
      workspaceId: subscriber.workspaceId,
      userId: subscriber.userId,
      sessionId: subscriber.sessionId,
      socketId: subscriber.socketId,
      filters: subscriber.filters,
      permissions: subscriber.permissions.ability.rules,
      oldSocketId: oldSocketId,
    };

    let promises: Promise<any>[] = [];

    // So we can know later on if this user can reuse this socketId for contexts persistence throughout disconnections
    promises.push(
      this.cache
        .registerSocketId(
          subscriber.workspaceId,
          subscriber.sessionId,
          subscriber.socketId
        )
        .catch(logger.error)
    );

    // So future prismeai-events instances know when to emit events to this subscriber
    promises.push(
      this.cache
        .registerSubscriber(
          subscriber.workspaceId,
          subscriber.sessionId,
          subscriber.socketId,
          publishedSubscriber
        )
        .catch(logger.error)
    );

    // So current prismeai-events instances know when to emit events to this subscriber
    promises.push(
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
        .catch(logger.error)
    );

    // Finally, clear subscriber from previous socketId if we just changed it
    if (oldSocketId) {
      promises.push(
        this.cache
          .unregisterSubscriber(
            subscriber.workspaceId,
            subscriber.sessionId,
            oldSocketId
          )
          .catch(logger.error)
      );
    }

    await Promise.all(promises);
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

    let oldSocketId;
    if (update?.filters) {
      subscriber.filters = update.filters;
    }
    if (update?.socketId) {
      oldSocketId = subscriber.socketId;
      // Here we use saveSubscriber() to get rid of any duplicate subscribers that could have been retrieved from cache
      // If we'd mutated directly subscriber.socketId, we might end up with 2 or more subscribers with the same socketId, resulting in events received twice by the same socket
      this.saveSubscriber(
        { ...subscriber, socketId: update.socketId },
        { oldSocketId }
      );
    }

    this.registerSubscriber(subscriber, oldSocketId);

    return true;
  }
}
