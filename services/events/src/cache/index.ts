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
  };

  return new (DriverClass as any as new (opts: CacheOptions) => Cache)(opts);
}
