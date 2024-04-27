import { Rule } from '@prisme.ai/permissions';
import RedisCache from './redis';
import { CacheDriver, CacheOptions, CacheKeyType, getCacheKey } from './types';

export * from './types';

export enum CacheType {
  Redis = 'redis',
}

// Subscribers that have not been updated (meaning no reconnection or filter update) since this TTL will be removed from cache
const SUBSCRIBER_TTL = 3600 * 12;

export type WorkspaceSubscriber = Omit<
  Prismeai.JoinedWorkspaceSubscriber['payload'],
  'permissions'
> & {
  permissions: Rule[];
};

export interface Cache extends CacheDriver {
  listUserTopics(workspaceId: string, userId: string): Promise<string[]>;
  joinUserTopic(
    workspaceId: string,
    userId: string,
    topic: string
  ): Promise<number>;

  registerSocketId(
    workspaceId: string,
    sessionId: string,
    socketId: string
  ): Promise<void>;
  isKnownSocketId(
    workspaceId: string,
    sessionId: string,
    socketId: string
  ): Promise<boolean>;

  registerSubscriber(
    workspaceId: string,
    sessionId: string,
    socketId: string,
    subscriber: WorkspaceSubscriber
  ): Promise<boolean>;
  unregisterSubscriber(
    workspaceId: string,
    sessionId: string,
    socketId: string
  ): Promise<boolean>;
  getAllWorkspaceSubscribers(): Promise<Record<string, WorkspaceSubscriber[]>>;
  getWorkspaceSubscriber(
    workspaceId: string,
    sessionId: string,
    socketId: string
  ): Promise<WorkspaceSubscriber | false>;
}

export function buildCache(opts: CacheOptions): Cache {
  let parent: new (opts: CacheOptions) => CacheDriver;
  switch (opts.type) {
    case CacheType.Redis:
      parent = RedisCache;
      break;
    default:
      throw new Error(`Cache driver '${opts.type}' does not exist.`);
  }
  const DriverClass = class extends parent implements Cache {
    constructor(opts: CacheOptions) {
      super(opts);
    }

    async joinUserTopic(workspaceId: string, userId: string, topic: string) {
      return await this.addToSet(
        getCacheKey(CacheKeyType.UserTopics, { workspaceId, userId }),
        topic
      );
    }

    async listUserTopics(workspaceId: string, userId: string) {
      return await this.listSet(
        getCacheKey(CacheKeyType.UserTopics, { workspaceId, userId })
      );
    }

    async registerSocketId(
      workspaceId: string,
      sessionId: string,
      socketId: string
    ): Promise<void> {
      await this.addToSet(
        getCacheKey(CacheKeyType.SessionSockets, { workspaceId, sessionId }),
        socketId,
        {
          ttl: 3600 * 12,
        }
      );
    }

    async isKnownSocketId(
      workspaceId: string,
      sessionId: string,
      socketId: string
    ): Promise<boolean> {
      return await this.isInSet(
        getCacheKey(CacheKeyType.SessionSockets, { workspaceId, sessionId }),
        socketId
      );
    }

    async registerSubscriber(
      workspaceId: string,
      sessionId: string,
      socketId: string,
      subscriber: any
    ): Promise<boolean> {
      subscriber.updatedAt = `${new Date().toISOString()}`;
      return await this.hSet(
        getCacheKey(CacheKeyType.WorkspaceSubscribers, { workspaceId }),
        `${sessionId}:${socketId}`,
        JSON.stringify(subscriber),
        {
          ttl: SUBSCRIBER_TTL,
        }
      );
    }

    async getAllWorkspaceSubscribers(): Promise<
      Record<string, WorkspaceSubscriber[]>
    > {
      // When pulling subscribers from cache, also delete inactive entries (i.e which might remain from a crashed instance) to keep our cache clean & light
      const expiredEntries: { workspaceKey: string; field: string }[] = [];
      const now = Date.now();

      const workspaces = await this.listKeys(
        getCacheKey(CacheKeyType.WorkspaceSubscribers, { workspaceId: '*' })
      );
      const subscribersList: WorkspaceSubscriber[][] = await Promise.all(
        workspaces.map(async (workspaceKey) => {
          const workspaceSubscribers = await this.hGetAll(workspaceKey);
          return Object.entries(workspaceSubscribers).reduce<
            WorkspaceSubscriber[]
          >((subscribers, [field, str]) => {
            try {
              const subscriber = JSON.parse(str) as WorkspaceSubscriber;
              if (
                !subscriber.updatedAt ||
                now - new Date(subscriber.updatedAt).getTime() >
                  SUBSCRIBER_TTL * 1000
              ) {
                expiredEntries.push({
                  workspaceKey,
                  field,
                });
                return subscribers;
              }
              return [...subscribers, subscriber];
            } catch {
              return subscribers;
            }
          }, []);
        })
      );

      if (expiredEntries?.length) {
        Promise.all(
          expiredEntries.map(({ workspaceKey, field }) =>
            this.hDel(workspaceKey, field)
          )
        ).then((result) =>
          console.log(
            `Cleaned ${result.length} inactive subscriber entries from cache`
          )
        );
      }

      return subscribersList.reduce((workspaceSubscribers, curList) => {
        const curWorkspaceId = curList.find(
          (cur) => cur.workspaceId
        )?.workspaceId;
        if (!curWorkspaceId) {
          // This workpace is empty in our cache, skipp
          return workspaceSubscribers;
        }
        return {
          ...workspaceSubscribers,
          [curWorkspaceId]: curList,
        };
      }, {});
    }

    async getWorkspaceSubscriber(
      workspaceId: string,
      sessionId: string,
      socketId: string
    ): Promise<WorkspaceSubscriber | false> {
      try {
        const str = await this.hGet(
          getCacheKey(CacheKeyType.WorkspaceSubscribers, { workspaceId }),
          `${sessionId}:${socketId}`
        );
        return JSON.parse(str) as WorkspaceSubscriber;
      } catch {
        return false;
      }
    }

    async unregisterSubscriber(
      workspaceId: string,
      sessionId: string,
      socketId: string
    ): Promise<boolean> {
      return await this.hDel(
        getCacheKey(CacheKeyType.WorkspaceSubscribers, { workspaceId }),
        `${sessionId}:${socketId}`
      );
    }
  };

  return new (DriverClass as any as new (opts: CacheOptions) => Cache)(opts);
}
