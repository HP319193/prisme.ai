export enum StoreDriverType {
  Elasticsearch = 'elasticsearch',
}

export interface StoreDriverOptions {
  driver: StoreDriverType;
  host: string;
  user?: string;
  password?: string;
  driverOptions: any;
}

export type PayloadQuery = Record<string, string>;

export type SearchOptions = Omit<
  PrismeaiAPI.EventsLongpolling.QueryParameters,
  'query' | 'types'
> & {
  payloadQuery?: PayloadQuery;
  types?: string[];
};

export interface EventsStore {
  search(
    workspaceId: string,
    options: SearchOptions
  ): Promise<Prismeai.PrismeEvent[]>;
  values(
    workspaceId: string,
    options: SearchOptions,
    fields: string[]
  ): Promise<PrismeaiAPI.EventsValues.Responses.$200['result']>;
  bulkInsert(events: Prismeai.PrismeEvent[]): Promise<any>;
}
