import { Broker, PrismeEvent } from '@prisme.ai/broker';
import { Cache, WorkspaceSubscriber } from '../../../cache';
import { EventType } from '../../../eda';
import { AccessManager, SubjectType, ActionType } from '../../../permissions';
import { getWorkspaceUser } from '../users';
import { Permissions, Rules } from '@prisme.ai/permissions';
import { logger } from '../../../logger';
import { Readable } from 'stream';
import { QueryEngine } from './filters/engine';
import {
  LocalSubscriber,
  SocketId,
  Subscriber,
  TargetTopic,
  WorkspaceId,
  WorkspaceSubscribers,
} from './types';
import { updateSubscriberUserTopics } from './updateSubscriberUserTopics';
import { ClusterNode, ClusterNodeState } from '../../cluster';

export * from './types';

export class Subscriptions extends Readable {
  public broker: Broker;
  public accessManager: AccessManager;
  private subscribers: Record<WorkspaceId, WorkspaceSubscribers>;
  private targetTopics: Record<TargetTopic, Record<WorkspaceId, Set<SocketId>>>;
  private queries: Record<WorkspaceId, QueryEngine>;
  private cache: Cache;

  public cluster: ClusterNode;

  constructor(
    broker: Broker,
    accessManager: AccessManager,
    cache: Cache,
    cluster: ClusterNode
  ) {
    super({ objectMode: true });
    this.broker = broker;
    this.targetTopics = {};
    this.queries = {};
    this.subscribers = {};
    this.accessManager = accessManager;
    this.cache = cache;
    this.cluster = cluster;

    // cache workspaces in accessManager
    const uncachedFetch = (this.accessManager as any).fetch.bind(
      this.accessManager
    );
    const cachedWorkspaces: Record<
      string,
      {
        updatedAt: number;
        data: any;
      }
    > = {};
    (this.accessManager as any).fetch = async (
      subjectType: any,
      id: string
    ) => {
      if (subjectType !== SubjectType.Workspace) {
        return uncachedFetch(subjectType, id);
      }

      // Keep workspaces in cache for 5s so we avoid heavy database traffic on peak usage while keeping this cache simple
      if (
        !cachedWorkspaces[id] ||
        Date.now() - cachedWorkspaces[id].updatedAt > 5000
      ) {
        cachedWorkspaces[id] = {
          updatedAt: Date.now(),
          data: await uncachedFetch(subjectType, id),
        };
      }

      return cachedWorkspaces[id].data;
    };
  }

  _read(): void {
    return;
  }

  metrics() {
    const workspaceSubscriptions = Object.entries(this.subscribers);
    const totalSubscribers = workspaceSubscriptions.reduce(
      (total, [, { socketIds }]) => total + Object.values(socketIds).length,
      0
    );
    return {
      workspacesNb: workspaceSubscriptions.length,
      totalSubscribers,
    };
  }

  private setSubscriber(subscriber: Subscriber) {
    const workspaceId = subscriber.workspaceId;
    if (!(workspaceId in this.subscribers)) {
      this.subscribers[workspaceId] = {
        socketIds: {},
        userIds: {},
      };
    }
    if (!(subscriber.userId in this.subscribers[workspaceId].userIds)) {
      this.subscribers[workspaceId].userIds[subscriber.userId] = new Set();
    }

    this.subscribers[workspaceId].socketIds[subscriber.socketId] = subscriber;
    this.subscribers[workspaceId].userIds[subscriber.userId].add(
      subscriber.socketId
    );

    if (!this.queries[workspaceId]) {
      this.queries[workspaceId] = new QueryEngine();
    }
    this.queries[workspaceId].saveQuery(
      subscriber.socketId,
      subscriber.filters
    );

    if (subscriber.targetTopic) {
      if (!this.targetTopics[subscriber.targetTopic]) {
        this.targetTopics[subscriber.targetTopic] = {};
      }
      if (!this.targetTopics[subscriber.targetTopic][workspaceId]) {
        this.targetTopics[subscriber.targetTopic][workspaceId] = new Set();
      }
      this.targetTopics[subscriber.targetTopic][workspaceId].add(
        subscriber.socketId
      );
    }
  }

  private unsetSubscriber(workspaceId: string, socketId: string) {
    if (!(workspaceId in this.subscribers)) {
      this.subscribers[workspaceId] = {
        socketIds: {},
        userIds: {},
      };
    }
    if (!this.queries[workspaceId]) {
      this.queries[workspaceId] = new QueryEngine();
    }

    // Remove associated query
    this.queries[workspaceId].removeQuery(socketId);

    // Remove subscriber refs from this.subscribers
    const subscriber = this.subscribers[workspaceId]?.socketIds?.[socketId];
    if (!subscriber) {
      return;
    }

    if (!(subscriber?.userId in this.subscribers[workspaceId].userIds)) {
      this.subscribers[workspaceId].userIds[subscriber.userId] = new Set();
    }

    if (subscriber) {
      delete this.subscribers[workspaceId].socketIds[socketId];
      this.subscribers[workspaceId].userIds[subscriber.userId].delete(socketId);

      const targetTopic =
        subscriber.targetTopic &&
        this.targetTopics[subscriber.targetTopic]?.[workspaceId];
      if (targetTopic) {
        targetTopic.delete(socketId);
      }
    }

    return subscriber;
  }

  async initClusterSynchronization() {
    await this.initSubscribersSynchronization();

    // When a node normally exits
    this.cluster.on('left', (node: ClusterNodeState) => {
      this.releaseAllSubscribersFromTopic(node.targetTopic);
    });

    // When an inactive node is detected, force cache cleanup as it might not have been done in case of a crash
    this.cluster.on('inactive', (node: ClusterNodeState) => {
      this.releaseAllSubscribersFromTopic(node.targetTopic, true);
    });
  }

  private async releaseAllSubscribersFromTopic(
    targetTopic: string,
    clearCache?: boolean
  ) {
    const removeSubscribers: {
      socketId: string;
      sessionId: string;
      workspaceId: string;
    }[] = [];
    const targetWorkspaces: Record<WorkspaceId, Set<SocketId>> = this
      .targetTopics[targetTopic] || {};

    for (let [workspaceId, socketIds] of Object.entries(targetWorkspaces)) {
      const currentSize = socketIds.size;
      socketIds.forEach((socketId) => {
        const subscriber = this.unsetSubscriber(workspaceId, socketId);
        if (subscriber) {
          removeSubscribers.push({
            socketId: subscriber.socketId,
            sessionId: subscriber.sessionId,
            workspaceId: subscriber.workspaceId,
          });
        }
      });

      const filteredSize =
        this.targetTopics?.[targetTopic]?.[workspaceId]?.size || 0;
      if (filteredSize < currentSize) {
        logger.info({
          msg: `Removed ${
            currentSize - filteredSize
          } subscribers from left node topic ${targetTopic}`,
        });
      }
    }

    delete this.targetTopics[targetTopic];

    // Also clear from cache
    if (clearCache && removeSubscribers.length) {
      await Promise.all(
        removeSubscribers.map((cur) =>
          this.cache.unregisterSubscriber(
            cur.workspaceId,
            cur.sessionId,
            cur.socketId
          )
        )
      );
      logger.info({
        msg: `Cleared ${removeSubscribers.length} subscribers from node topic ${targetTopic}`,
      });
    }
  }

  async close() {
    await this.releaseAllSubscribersFromTopic(this.cluster.localTopic, true);
  }

  private async initSubscribersSynchronization() {
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
        // Drop this subscriber if its hosting node is not up anymore
        if (!this.cluster.clusterTopics.has(subscriber.targetTopic)) {
          continue;
        }
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
      const workspaceId = event?.source?.workspaceId;
      const queryEngine = this.queries[workspaceId];
      const workspaceSubscribers = this.subscribers[workspaceId] || {};
      if (!workspaceId || !queryEngine || !workspaceSubscribers) {
        return;
      }

      // If we do not have any subscriber corresponding to this event socketId, this means we are late on events.subscribers.* live synchronization & need to pull from cache
      if (
        event?.source?.socketId &&
        !workspaceSubscribers.socketIds?.[event?.source?.socketId]
      ) {
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
        }
      }

      const matchingSocketIds = queryEngine.matches(event);
      const matchingSubscribers: Subscriber[] = [];

      for (let socketId of matchingSocketIds) {
        const subscriber = workspaceSubscribers?.socketIds[socketId];
        if (!subscriber) {
          logger.warn({
            msg: `Query engine returned a matching socketId '${socketId}' but no known subscriber matches this socketId !`,
            workspaceId,
          });
          continue;
        }

        const readable = subscriber.permissions.can(
          ActionType.Read,
          SubjectType.Event,
          event
        );
        if (readable) {
          matchingSubscribers.push(subscriber);
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
        const workspaceSubscribers = this.subscribers[workspaceId];
        if (!workspaceSubscribers) {
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
              this.subscribers[workspaceId]?.userIds?.[userId] || new Set();
            activeSubscribers.forEach((socketId) => {
              const subscriber = workspaceSubscribers?.socketIds?.[socketId];
              if (subscriber) {
                updateSubscriberUserTopics(subscriber, topicName);
                this.registerSubscriber(subscriber);
              }
            });
            return result;
          })
        );

        return true;
      }
    );
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
      targetTopic: string;
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
    logger.trace({
      msg: `Retrieved subscriber userTopics`,
      userId: subscriber.userId,
      sessionId: subscriber.sessionId,
      socketId: subscriber.socketId,
      workspaceId,
    });
    const userAccessManager = await this.accessManager.as(
      workspaceUser,
      subscriber.apiKey
    );

    await userAccessManager.pullRoleFromSubject(
      SubjectType.Workspace,
      workspaceId
    );
    logger.trace({
      msg: `Retrieved user's workspace permissions`,
      userId: subscriber.userId,
      sessionId: subscriber.sessionId,
      socketId: subscriber.socketId,
      workspaceId,
    });

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
    const workspaceId = subscriber.workspaceId;

    // First check if this subscriber already exists to keep it updated without pushing it twice
    // If we were given an oldSocketId, keep the corresponding subscriber in priority so we don't reinstantiate Subscriber instance currently used by local websockets
    const existingSubscriber =
      (opts?.oldSocketId &&
        this.subscribers[workspaceId]?.socketIds?.[opts.oldSocketId]) ||
      this.subscribers[workspaceId]?.socketIds?.[subscriber.socketId];

    const previousSocketId =
      opts?.oldSocketId && existingSubscriber.socketId === opts?.oldSocketId
        ? opts?.oldSocketId
        : undefined;

    if (opts?.oldSocketId) {
      this.unsetSubscriber(workspaceId, opts.oldSocketId);
    }

    if (!existingSubscriber) {
      this.setSubscriber(subscriber);
      logger.debug({
        msg: 'Adding new subscriber',
        workspaceId: workspaceId,
        userId: subscriber.userId,
        socketId: subscriber.socketId,
        filters: subscriber.filters,
      });
      return true;
    }

    if (opts?.disableUpdate) {
      return false;
    }

    Object.assign(existingSubscriber, {
      socketId: subscriber.socketId,
      filters: subscriber.filters,
      permissions: subscriber.permissions,
      targetTopic: subscriber.targetTopic,
    });
    // Even on update we still setSubscriber since it could be a socketId update, which thus needs to be set again
    this.setSubscriber(existingSubscriber);
    logger.debug({
      msg: 'Update existing subscriber',
      workspaceId: existingSubscriber.workspaceId,
      userId: existingSubscriber.userId,
      socketId: existingSubscriber.socketId,
      previousSocketId,
      filters: existingSubscriber.filters,
      targetTopic: existingSubscriber.targetTopic,
    });

    return false;
  }

  // Declare the new or updated Subscriber to the rest of the cluster
  private async registerSubscriber(
    subscriber: Subscriber,
    oldSocketId?: string
  ) {
    if (!subscriber.permissions?.ability?.rules) {
      logger.warn({
        msg: `Trying to register a subscriber with undefined permissions`,
        workspaceId: subscriber.workspaceId,
        userId: subscriber.userId,
        socketId: subscriber.socketId,
      });
    }

    const publishedSubscriber: WorkspaceSubscriber = {
      workspaceId: subscriber.workspaceId,
      userId: subscriber.userId,
      sessionId: subscriber.sessionId,
      socketId: subscriber.socketId,
      filters: subscriber.filters,
      permissions: subscriber.permissions?.ability?.rules || [],
      oldSocketId: oldSocketId,
      targetTopic: subscriber.targetTopic,
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
        .catch((err) => logger.error({ err }))
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
        .catch((err) => logger.error({ err }))
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
        .catch((err) => logger.error({ err }))
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
          .catch((err) => logger.error({ err }))
      );
    }

    await Promise.all(promises);
  }

  async unregisterSubscriber(
    subscriber: Omit<Subscriber, 'permissions'>,
    emit?: boolean
  ) {
    this.unsetSubscriber(subscriber.workspaceId, subscriber.socketId);

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
      .catch((err) => logger.error({ err }));

    this.cache
      .unregisterSubscriber(
        subscriber.workspaceId,
        subscriber.sessionId,
        subscriber.socketId
      )
      .catch((err) => logger.error({ err }));
  }

  async isAllowedSubscriberSocketId(
    workspaceId: string,
    sessionId: string,
    socketId: string
  ) {
    return await this.cache.isKnownSocketId(workspaceId, sessionId, socketId);
  }

  async updateLocalSubscriber(
    subscriber: LocalSubscriber,
    update: { socketId?: string; filters?: any }
  ) {
    if (update?.socketId) {
      // Allow keeping same socketIds accross reconnection
      // in order to make runtime socket context persistent through reconnections
      const allowed = await this.isAllowedSubscriberSocketId(
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
