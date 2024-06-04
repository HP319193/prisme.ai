export type Field = string;
export type CandidateValue = any;
export type QueryId = string;
export type QueryList = QueryId[];

export interface QueryProcessor {
  type(): QueryType;
  removeQuery(id: QueryId): void;
  saveQuery(id: QueryId, query: any): void;
  matches(data: any): QueryList; // Returns list of matching queries
}

export enum QueryType {
  Text = 'text',
  Types = 'types',
  // BeforeDate = 'beforeDate',
  // AfterDte = 'afterDate',
  AppInstanceDepth = 'appInstanceDepth',
  PayloadQuery = 'payloadQuery',
}
