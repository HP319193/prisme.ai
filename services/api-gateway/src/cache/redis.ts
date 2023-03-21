import { createClient, RedisClientType } from '@redis/client';
import { SetOptions } from '.';
import { eda } from '../config';
import { CacheDriver, CacheOptions } from './types';

export default class RedisCache implements CacheDriver {
  private client: RedisClientType;

  constructor(opts: CacheOptions) {
    this.client = createClient({
      url: opts.host,
      password: opts.password,
      name: `${eda.APP_NAME}-cache`,
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

  async delete(key: string) {
    return await this.client.del(key);
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
}
