export enum StoreDriverType {
  Elasticsearch = 'elasticsearch',
  Opensearch = 'opensearch',
}

export interface StoreDriverOptions {
  driver: StoreDriverType;
  host: string;
  user?: string;
  password?: string;
  driverOptions: any;
}

export type PayloadQuery = Record<string, string | string[]>;
export type OrQuery = PayloadQuery[];

export type SearchOptions = Omit<
  PrismeaiAPI.EventsLongpolling.QueryParameters,
  'query' | 'types'
> & {
  payloadQuery?: PayloadQuery | OrQuery;
  types?: string[];
};

export type BulkInsertResult =
  | true
  | {
      error: {
        throttle?: boolean;
        error: 'RateLimitError';
        failedItems: Prismeai.PrismeEvent[];
      };
    };
export interface EventsStore {
  search(
    workspaceId: string,
    options: SearchOptions
  ): Promise<Prismeai.PrismeEvent[]>;
  bulkInsert(events: Prismeai.PrismeEvent[]): Promise<BulkInsertResult>;
  workspaceUsage(
    workspaceId: string,
    opts: PrismeaiAPI.WorkspaceUsage.QueryParameters
  ): Promise<Prismeai.WorkspaceUsage>;
  closeWorkspace(workspaceId: string): Promise<any>;
}

export interface EventIndexStats {
  count: number;
  size: number;
  lastIndex: string;
  indices: { name: string; size: number }[];
}

export type EventsIndicesStats = Record<string, EventIndexStats>;

export type ElasticBucket<
  AdditionalBuckets = Record<
    string,
    {
      buckets: ElasticBucket[];
    }
  >
> = {
  key: string;
  doc_count: number;
  buckets?: ElasticBucket[];
} & AdditionalBuckets;
