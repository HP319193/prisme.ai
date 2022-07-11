export interface CacheDriver {
  connect(): Promise<boolean>;

  get(key: string): Promise<any>;
  set(key: string, value: any, opts?: SetOptions): Promise<any>;

  getObject<T = object>(key: string): Promise<T | undefined>;
  setObject(key: string, value: object, opts?: SetOptions): Promise<any>;

  addToSet(key: string, value: any | any[]): Promise<number>;
  isInSet(key: string, value: any): Promise<boolean>;
  listSet(key: string): Promise<any>;
}

export interface CacheOptions {
  type: string;
  host: string;
  password?: string;
}

export interface SetOptions {
  ttl?: number;
}

export enum CacheKeyType {
  UserTopics = 'userTopics',
}
type CacheKeyArguments = {
  [CacheKeyType.UserTopics]: {
    userId: string;
    workspaceId: string;
  };
};

export function getCacheKey<T extends CacheKeyType>(
  type: T,
  opts: CacheKeyArguments[T]
) {
  switch (type) {
    case CacheKeyType.UserTopics: {
      const { userId, workspaceId } =
        opts as any as CacheKeyArguments[CacheKeyType.UserTopics];
      return `events:workspace:${workspaceId}:user:${userId}:topics`;
    }
  }

  throw new Error('Undefined cache key type ' + type);
}
