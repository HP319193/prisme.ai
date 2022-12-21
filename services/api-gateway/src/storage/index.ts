export * from './types';
import { StorageDriver, StorageOptions } from '.';
import { MongodbDriver } from './mongodb';
import { ConfigurationError } from '../types/errors';

export enum StorageDriverType {
  Mongodb = 'mongodb',
}

const createdDrivers: StorageDriver<any>[] = [];
export function buildStorage<Model>(
  name: string,
  opts: StorageOptions
): StorageDriver<Model> {
  switch (opts.driver) {
    case StorageDriverType.Mongodb:
      const driver = new MongodbDriver(opts.host, opts.driverOptions, name);
      createdDrivers.push(driver);
      return driver;
    default:
      throw new ConfigurationError(`Invalid Users storage "${opts.driver}"`, {
        storage: opts.driver,
      });
  }
}

export async function closeStorage() {
  return await Promise.all(createdDrivers.map((cur) => cur.close()));
}
