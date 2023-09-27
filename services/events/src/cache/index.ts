import RedisCache from './redis';
import { CacheDriver, CacheOptions, CacheKeyType, getCacheKey } from './types';

export * from './types';

export enum CacheType {
  Redis = 'redis',
}

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
  };

  return new (DriverClass as any as new (opts: CacheOptions) => Cache)(opts);
}
