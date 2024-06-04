import { QueryId, QueryProcessor, QueryType } from './types';

interface Query {
  depthMatch: DepthMatch;
}

interface DepthMatch {
  max: number;
  query: QueryId;
}

export class AppInstanceDepthQueryProcessor implements QueryProcessor {
  private queries: Record<QueryId, Query>;
  private depthMatches: DepthMatch[];

  constructor() {
    this.queries = {};
    this.depthMatches = [];
  }

  type() {
    return QueryType.AppInstanceDepth;
  }

  removeQuery(id: string): void {
    if (this.queries[id]) {
      this.depthMatches = this.depthMatches.filter((cur) => cur.query !== id);
      this.queries[id];
    }
  }

  saveQuery(id: string, maxDepth: number): void {
    this.removeQuery(id);

    const depthMatch = {
      query: id,
      max: maxDepth,
    };
    const query: Query = {
      depthMatch,
    };

    this.depthMatches = this.depthMatches
      .concat(depthMatch)
      .sort((a, b) => b.max - a.max); // Sort from biggest maxDepth to lowest
    this.queries[id] = query;
  }

  matches(event: any) {
    const eventDepth = event?.source?.appInstanceDepth;
    if (!eventDepth) {
      return this.depthMatches.map((cur) => cur.query);
    }
    const matchingQueries: string[] = [];
    for (let depthMatch of this.depthMatches) {
      if (depthMatch.max < eventDepth) {
        break;
      }
      matchingQueries.push(depthMatch.query);
    }

    return matchingQueries;
  }
}
