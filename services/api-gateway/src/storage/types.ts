import { CacheDriver } from '../cache';

export interface StorageOptions {
  driver: string;
  host: string;
  password?: string;
  driverOptions: any;
  cache?: {
    key: string;
    ttl?: number;
    driver: CacheDriver;
  };
  indexes?: string[];
  uniqueIndexes?: string[];
  ttlKey?: string;
}

export interface SaveOpts<Model> {
  upsertQuery?: Partial<Model> & Record<string, any>;
}

export interface FindOpts {
  page?: number;
  limit?: number;
}
export interface StorageDriver<Model> {
  connect(): Promise<void>;
  close(): Promise<void>;

  save(data: Model, opts?: SaveOpts<Model>): Promise<Model>;
  get(id: string): Promise<Model>;
  count(query: Partial<Model> & Record<string, any>): Promise<number>;
  find(
    query: Partial<Model> & Record<string, any>,
    opts?: FindOpts
  ): Promise<Model[]>;
  delete(id: string | Partial<Model>): Promise<boolean>;
}
