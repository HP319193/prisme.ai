import { IStorage } from './types';

export function cache(driver: IStorage): IStorage {
  if ((driver as any).cache) {
    return driver;
  }
  return {
    __proto__: driver,
    cache: {},
    async get(id: string) {
      if (id in this.cache) {
        return this.cache[id];
      }
      const value = await super.get(id);
      this.cache[id] = value;
      return value;
    },
    async save(id: string, data: any, ...args: any) {
      const result = await super.save(id, data, ...args);
      this.cache[id] = data;
      return result;
    },
  } as any as IStorage;
}
