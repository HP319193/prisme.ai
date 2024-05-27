export interface CacheDriver {
  connect(): Promise<boolean>;

  get(key: string): Promise<any>;
  set(key: string, value: any, opts?: SetOptions): Promise<any>;

  listKeys(pattern: string): Promise<string[]>;

  getObject<T = object>(key: string): Promise<T | undefined>;
  setObject(key: string, value: object, opts?: SetOptions): Promise<any>;

  addToSet(
    key: string,
    value: any | any[],
    opts?: Omit<SetOptions, 'ttl'>
  ): Promise<number>;
  isInSet(key: string, value: any): Promise<boolean>;
  listSet(key: string): Promise<any>;

  hSet(
    key: string,
    field: string,
    value: any,
    opts?: SetOptions
  ): Promise<boolean>;
  hDel(key: string, field: string): Promise<boolean>;
  hGet(key: string, field: string): Promise<any>;
  hGetAll(key: string): Promise<Record<string, any>>;
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
  SessionSockets = 'sessionSockets',
  WorkspaceSubscribers = 'workspaceSubscribers',
  ClusterNode = 'clusterNode',
}
type CacheKeyArguments = {
  [CacheKeyType.UserTopics]: {
    userId: string;
    workspaceId: string;
  };
  [CacheKeyType.SessionSockets]: {
    sessionId: string;
    workspaceId: string;
  };
  [CacheKeyType.WorkspaceSubscribers]: {
    workspaceId: string;
  };
  [CacheKeyType.ClusterNode]: {};
};

export function getCacheKey<
  T extends CacheKeyType,
  V extends CacheKeyArguments[T] = CacheKeyArguments[T]
>(type: T, opts: V) {
  switch (type) {
    case CacheKeyType.UserTopics: {
      const { userId, workspaceId } =
        opts as any as CacheKeyArguments[CacheKeyType.UserTopics];
      return `events:workspace:${workspaceId}:user:${userId}:topics`;
    }
    case CacheKeyType.SessionSockets: {
      const { sessionId, workspaceId } =
        opts as any as CacheKeyArguments[CacheKeyType.SessionSockets];
      return `events:workspace:${workspaceId}:session:${sessionId}:sockets`;
    }
    case CacheKeyType.WorkspaceSubscribers: {
      const { workspaceId } =
        opts as any as CacheKeyArguments[CacheKeyType.WorkspaceSubscribers];
      return `events:workspace:${workspaceId}:subscribers`;
    }
    case CacheKeyType.ClusterNode: {
      return `events:nodes`;
    }
  }

  throw new Error('Undefined cache key type ' + type);
}
