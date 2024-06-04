import { QueryId, QueryProcessor, QueryType } from './types';

interface Query {
  textMatch: TextMatch;
}

interface TextMatch {
  text: string;
  query: QueryId;
}

export class TextQueryProcessor implements QueryProcessor {
  private queries: Record<QueryId, Query>;
  private textMatches: TextMatch[];

  constructor() {
    this.queries = {};
    this.textMatches = [];
  }

  type() {
    return QueryType.Text;
  }

  removeQuery(id: string): void {
    if (this.queries[id]) {
      this.textMatches = this.textMatches.filter((cur) => cur.query !== id);
      this.queries[id];
    }
  }

  saveQuery(id: string, text: string): void {
    this.removeQuery(id);

    const textMatch = {
      query: id,
      text,
    };
    const query: Query = {
      textMatch,
    };

    this.textMatches.push(textMatch);
    this.queries[id] = query;
  }

  matches(data: any) {
    const serializedData = JSON.stringify(data);
    const matchingQueries: string[] = [];
    for (let textMatch of this.textMatches) {
      if (serializedData.includes(textMatch.text)) {
        matchingQueries.push(textMatch.query);
      }
    }

    return matchingQueries;
  }
}
