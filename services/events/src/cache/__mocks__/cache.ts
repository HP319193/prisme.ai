import { CacheDriver } from '..';
import { SetOptions } from '../types';

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
    throw new Error('Not implemented');
  }

  isInSet(key: string, value: any): Promise<boolean> {
    throw new Error('Not implemented');
  }
  listSet(key: string): Promise<any> {
    throw new Error('Not implemented');
  }

  listKeys(pattern: string): Promise<string[]> {
    return Promise.resolve([]);
  }

  hSet(
    key: string,
    field: string,
    value: any,
    opts?: SetOptions | undefined
  ): Promise<boolean> {
    return Promise.resolve(true);
  }

  hDel(key: string, field: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  hGetAll(key: string): Promise<Record<string, any>> {
    return Promise.resolve({});
  }

  listUserTopics() {
    return Promise.resolve([]);
  }

  joinUserTopic() {
    return Promise.resolve(1);
  }

  registerSocketId() {
    return Promise.resolve(true);
  }

  isKnownSocketId() {
    return Promise.resolve(true);
  }

  registerSubscriber() {
    return Promise.resolve(true);
  }

  unregisterSubscriber() {
    return Promise.resolve(true);
  }
}
