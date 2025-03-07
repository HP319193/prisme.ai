//@ts-ignore
import LRU from 'lru-cache';
import { PrismeaiSession } from '../services/runtime/contexts';
import RedisCache from './redis';
import { CacheDriver, CacheOptions, CacheKeyType, getCacheKey } from './types';

export * from './types';

export enum CacheType {
  Redis = 'redis',
}

export interface Cache extends CacheDriver {
  getSession(sessionId: string): Promise<PrismeaiSession | undefined>;
  setSession(session: PrismeaiSession): Promise<PrismeaiSession>;

  createUserTopic(workspaceId: string, topic: string): Promise<number>;
  checkUserTopicExists(workspaceId: string, topic: string): Promise<boolean>;
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
    private sessionsLRU: LRU<string, PrismeaiSession>;

    constructor(opts: CacheOptions) {
      super(opts);
      this.sessionsLRU = new LRU({
        max: 2000,
      });
    }

    async getSession(sessionId: string): Promise<PrismeaiSession | undefined> {
      let session;

      session = this.sessionsLRU.get(sessionId);
      if (!session) {
        session = (await this.getObject(
          getCacheKey(CacheKeyType.Session, { sessionId })
        )) as PrismeaiSession;
      }
      if (session?.expires) {
        const expiresIn =
          (new Date(session.expires).getTime() - Date.now()) / 1000;
        if (expiresIn > 0) {
          session.expiresIn = Math.round(expiresIn);
        }
      }
      return session;
    }

    async setSession(session: PrismeaiSession) {
      this.sessionsLRU.set(session.sessionId, session);
      return await this.setObject(
        getCacheKey(CacheKeyType.Session, session),
        session,
        {
          ttl: session.expiresIn,
        }
      );
    }

    async createUserTopic(workspaceId: string, topic: string) {
      return await this.addToSet(
        getCacheKey(CacheKeyType.AllUserTopics, { workspaceId }),
        topic
      );
    }

    async checkUserTopicExists(workspaceId: string, topic: string) {
      return await this.isInSet(
        getCacheKey(CacheKeyType.AllUserTopics, { workspaceId }),
        topic
      );
    }

    async joinUserTopic(workspaceId: string, userId: string, topic: string) {
      return await this.addToSet(
        getCacheKey(CacheKeyType.UserTopics, { workspaceId, userId }),
        topic
      );
    }
  };

  return new (DriverClass as any as new (opts: CacheOptions) => Cache)(opts);
}
