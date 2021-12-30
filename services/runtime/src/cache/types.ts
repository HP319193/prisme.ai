export interface CacheDriver {
  connect(): Promise<boolean>;

  get(key: string): Promise<any>;
  set(key: string, value: any, opts?: SetOptions): Promise<any>;

  getObject<T = object>(key: string): Promise<T | undefined>;
  setObject(key: string, value: object, opts?: SetOptions): Promise<any>;
}

export interface CacheOptions {
  type: string;
  host: string;
  password?: string;
}

export interface SetOptions {
  ttl?: number;
}
