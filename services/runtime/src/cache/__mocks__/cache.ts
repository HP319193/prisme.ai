import { CacheDriver } from '..';
import { CacheKeyType, getCacheKey, SetOptions } from '../types';

export let memoryCache: Record<string, any> = {};

export default class Cache implements CacheDriver {
  private cache: Record<string, any>;

  constructor(useSharedCache: boolean = false) {
    this.cache = useSharedCache ? memoryCache : {};
  }

  async connect() {
    return true;
  }

  async get(key: string): Promise<any> {
    return this.cache[key];
  }

  async set(key: string, value: any): Promise<void> {
    this.cache[key] = value;
  }

  async del(key: string): Promise<void> {
    delete this.cache[key];
  }

  getObject<T = object>(key: string): Promise<T | undefined> {
    return this.get(key);
  }

  setObject(key: string, value: object, opts?: SetOptions): Promise<any> {
    return this.set(key, value);
  }

  addToSet(key: string, value: any): Promise<number> {
    if (!(key in this.cache)) {
      this.cache[key] = new Set();
    }
    this.cache[key].add(value);
    return Promise.resolve(1);
  }

  isInSet(key: string, value: any): Promise<boolean> {
    return Promise.resolve(
      key in this.cache && (this.cache[key] as any).has(value)
    );
  }
  listSet(key: string): Promise<any> {
    return Promise.resolve([...(this.cache[key] || [])]);
  }

  async getSession(sessionId: string): Promise<any> {
    return (await this.getObject(
      getCacheKey(CacheKeyType.Session, { sessionId })
    )) as any;
  }

  async setSession(session: any) {
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
}
