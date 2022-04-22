import { CacheDriver } from '..';
import { SetOptions } from '../types';

let memoryCache: Record<string, any> = {};

export default class Cache implements CacheDriver {
  private cache: Record<string, any>;

  constructor() {
    this.cache = memoryCache;
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
}
