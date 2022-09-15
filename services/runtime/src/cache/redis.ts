import { createClient } from '@node-redis/client';
import { RedisClientType } from '@node-redis/client/dist/lib/client';
import { SetOptions } from '.';
import { CacheDriver, CacheOptions } from './types';

export default class RedisCache implements CacheDriver {
  private client: RedisClientType;

  constructor(opts: CacheOptions) {
    this.client = createClient({
      url: opts.host,
      password: opts.password,
    });
    this.client.on('error', (err: Error) => {
      console.error(`Error occured with cache redis driver : ${err}`);
    });
  }

  async connect() {
    await this.client.connect();
    return true;
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async set(key: string, value: any, { ttl }: SetOptions = {}) {
    return await this.client.set(key, value, {
      EX: ttl,
    });
  }

  async getObject<T = object>(key: string): Promise<T | undefined> {
    const raw = await this.get(key);
    if (!raw) {
      return undefined;
    }
    return JSON.parse(raw as string);
  }

  async setObject(key: string, object: object, opts?: SetOptions) {
    const raw = JSON.stringify(object || {});
    return await this.set(key, raw, opts);
  }

  async addToSet(key: string, value: any | any[]) {
    return await this.client.sAdd(key, value);
  }

  async isInSet(key: string, value: any): Promise<boolean> {
    return await this.client.sIsMember(key, value);
  }

  async listSet(key: string) {
    return await this.client.sMembers(key);
  }
}
