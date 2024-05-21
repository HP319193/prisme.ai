import { SearchOptions } from '../../store';
import { QueryProcessor, QueryType } from './types';
import { PayloadQueryProcessor } from './payloadQuery';
import { TextQueryProcessor } from './textQuery';
import { AppInstanceDepthQueryProcessor } from './appInstanceDepthQuery';
import { logger } from '../../../../logger';

interface Query {
  processors: QueryProcessor[];
}

class TypesQueryProcessor extends PayloadQueryProcessor {
  type(): QueryType {
    return QueryType.Types;
  }

  saveQuery(id: string, types: any): void {
    super.saveQuery(id, [
      {
        type: types,
      },
    ]);
  }
}

export class QueryEngine {
  queries: Record<string, Query>;
  processors: Record<QueryType, QueryProcessor>;

  constructor() {
    this.queries = {};
    this.processors = {
      [QueryType.PayloadQuery]: new PayloadQueryProcessor(),
      [QueryType.Types]: new TypesQueryProcessor(),
      [QueryType.Text]: new TextQueryProcessor(),
      [QueryType.AppInstanceDepth]: new AppInstanceDepthQueryProcessor(),
    };
  }

  saveQuery(id: string, queryOpts: SearchOptions) {
    let previousProcessors: Set<QueryType> = this.queries[id]?.processors
      ?.length
      ? new Set(this.queries[id].processors.map((cur) => cur.type()))
      : new Set();
    const query: Query = {
      processors: [],
    };

    for (let [queryType, processorParams] of Object.entries(queryOpts)) {
      const queryProcessor = this.processors[queryType as QueryType];
      if (!queryProcessor) {
        logger.error({
          msg: `No query processor found for type '${queryType}'`,
          query: queryOpts,
        });
        continue;
      }

      queryProcessor.saveQuery(id, processorParams);
      query.processors.push(queryProcessor);
      previousProcessors.delete(queryType as QueryType);
    }

    // Remove previous processors we did not receive in this new update
    [...previousProcessors].forEach((cur) => {
      this.processors[cur].removeQuery(id);
    });

    // If no filter were provided, consider it as a wildcard
    if (!query.processors.length) {
      this.processors[QueryType.PayloadQuery].saveQuery(id, {});
      query.processors.push(this.processors[QueryType.PayloadQuery]);
    }

    this.queries[id] = query;
  }

  removeQuery(id: string) {
    const query = this.queries[id];
    if (!query) {
      return;
    }
    query.processors.forEach((cur) => {
      cur.removeQuery(id);
    });
    delete this.queries[id];
  }

  matches(data: any) {
    // Map queryIds to their number of matching processors
    const matchingQueries: Record<string, number> = {};
    for (let processor of Object.values(this.processors)) {
      const newQueryIds = [...new Set(processor.matches(data))];
      newQueryIds.forEach((queryId) => {
        if (!matchingQueries[queryId]) {
          matchingQueries[queryId] = 0;
        }
        matchingQueries[queryId]++;
      });
    }

    // Return all query ids that fulfilled all of their processors
    return Object.entries(matchingQueries).reduce<string[]>(
      (fulfilled, [queryId, fulfilledProcessors]) => {
        if (
          fulfilledProcessors &&
          this.queries?.[queryId]?.processors?.length === fulfilledProcessors
        ) {
          fulfilled.push(queryId);
        }
        return fulfilled;
      },
      []
    );
  }
}
