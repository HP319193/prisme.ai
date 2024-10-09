import { createClient, RedisClientType } from '@redis/client';
import { SetOptions } from '.';
import eda from '../config/eda';
import { CacheDriver, CacheOptions } from './types';

export function buildRedis(name: string, opts: CacheOptions) {
  const { host, password, ...otherOpts } = opts;
  const client = createClient({
    url: opts.host,
    password: opts.password,
    name: `${eda.APP_NAME}-${name}`,
    ...otherOpts,
  });

  client.on('error', (err: Error) => {
    console.error(
      `Error occured with api-gateway ${name} redis driver : ${err}`
    );
  });
  client.on('connect', () => {
    console.info(`api-gateway ${name} redis connected.`);
  });
  client.on('reconnecting', () => {
    console.info(`api-gateway ${name} redis reconnecting ...`);
  });
  client.on('ready', () => {
    console.info(`api-gateway ${name} redis is ready.`);
  });
  return client as RedisClientType;
}
export default class RedisCache implements CacheDriver {
  public client: RedisClientType;
  private opts: Partial<CacheOptions>;

  constructor(opts: CacheOptions) {
    const { host: _, password: __, ...otherOpts } = opts;
    this.opts = otherOpts;
    this.client = buildRedis('cache', opts);
  }

  async connect() {
    await this.client.connect();
    return true;
  }

  private getKey(key: string) {
    if (!this.opts.prefix) {
      return key;
    }
    return `${this.opts.prefix}${key}`;
  }

  async get(key: string) {
    return await this.client.get(this.getKey(key));
  }

  async set(key: string, value: any, { ttl }: SetOptions = {}) {
    return await this.client.set(this.getKey(key), value, {
      EX: ttl,
    });
  }

  async delete(key: string) {
    return await this.client.del(this.getKey(key));
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
