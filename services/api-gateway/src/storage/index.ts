export * from './types';
import { StorageDriver, StorageOptions } from '.';
import { MongodbDriver } from './mongodb';
import { ConfigurationError } from '../types/errors';
import { SaveOpts } from './types';
import { CacheDriver } from '../cache';
import { logger } from '../logger';

export enum StorageDriverType {
  Mongodb = 'mongodb',
}

const createdDrivers: StorageDriver<any>[] = [];
export function buildStorage<Model>(
  name: string,
  opts: StorageOptions
): StorageDriver<Model> {
  let parent: new (name: string, opts: StorageOptions) => StorageDriver<Model>;
  switch (opts.driver) {
    case StorageDriverType.Mongodb:
      parent = MongodbDriver;
      break;
    default:
      throw new ConfigurationError(`Invalid storage "${opts.driver}"`, {
        storage: opts.driver,
      });
  }

  const DriverClass = class extends parent {
    private opts: StorageOptions;
    private cache?: CacheDriver;

    constructor(name: string, opts: StorageOptions) {
      super(name, opts);
      this.opts = opts;
      if (opts?.cache?.key) {
        if (!opts?.cache?.driver) {
          throw new Error('Missing cache driver');
        }
        this.cache = opts?.cache?.driver;
      }
    }

    private getCacheKey(query: Partial<Model>) {
      if (!this.opts.cache?.key || typeof query !== 'object') {
        return false;
      }
      const key = query?.[this.opts.cache?.key as keyof Model];
      if (!key) {
        return false;
      }
      return `cache:${key}`;
    }

    private updateCache(data: any) {
      const cacheKey = this.getCacheKey(data);
      if (!cacheKey || !this.cache) {
        return;
      }
      this.cache
        .setObject(cacheKey, data, {
          ttl: this.opts?.cache?.ttl || 3600 * 24 * 7, // By default, cache 7 days
        })
        .catch(logger.error);
    }

    async save(data: any, opts: SaveOpts<any>) {
      const ret = await super.save(data, opts);
      this.updateCache(ret);
      return ret;
    }

    async find(query: Partial<Model> & Record<string, any>) {
      const cacheKey = this.getCacheKey(query);
      if (cacheKey && this.cache) {
        try {
          const data = (await this.cache.getObject(cacheKey)) as Model;
          if (data) {
            return [data];
          }
        } catch {}
      }

      const result = await super.find(query);
      if (result.length == 1 && cacheKey) {
        this.updateCache(result[0]);
      }

      return result;
    }

    async delete(id: string | Partial<Model>): Promise<boolean> {
      const cacheKey = this.getCacheKey(id as Partial<Model>);
      if (cacheKey && this.cache) {
        try {
          this.cache.delete(cacheKey).catch(logger.error);
        } catch {}
      }
      return await super.delete(id);
    }
  };
  const driver = new DriverClass(name, opts);
  createdDrivers.push(driver);
  return driver;
}

export async function closeStorage() {
  return await Promise.all(createdDrivers.map((cur) => cur.close()));
}
