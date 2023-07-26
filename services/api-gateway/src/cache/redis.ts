import { createClient, RedisClientType } from '@redis/client';
import { SetOptions } from '.';
import { eda } from '../config';
import { CacheDriver, CacheOptions } from './types';

export default class RedisCache implements CacheDriver {
  public client: RedisClientType;
  private opts: Partial<CacheOptions>;

  constructor(opts: CacheOptions) {
    const { host, password, ...otherOpts } = opts;
    this.client = createClient({
      url: opts.host,
      password: opts.password,
      name: `${eda.APP_NAME}-cache`,
    });
    this.opts = otherOpts;
    this.client.on('error', (err: Error) => {
      console.error(
        `Error occured with api-gateway cache redis driver : ${err}`
      );
    });
    this.client.on('connect', () => {
      console.info('api-gateway cache redis connected.');
    });
    this.client.on('reconnecting', () => {
      console.info('api-gateway cache redis reconnecting ...');
    });
    this.client.on('ready', () => {
      console.info('api-gateway cache redis is ready.');
    });
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
