import { extractObjectsByPath } from '@prisme.ai/permissions/lib/utils';
import { OrQuery } from '../../store/types';
import {
  QueryId,
  CandidateValue,
  Field,
  QueryProcessor,
  QueryType,
} from './types';

interface Query {
  orQuery: Record<
    QueryId,
    {
      queryId: QueryId;
      fields: Set<string>;
    }
  >;
  fieldMatches: FieldMatch[];
}

interface FieldMatch {
  queries: QueryId[];
}
enum MatchMethod {
  EmptyMatch = 'EmptyMatch',
  WildardMatch = 'WildardMatch',
  ExactMatch = 'ExactMatch',
  Wildcard = 'ExactMatch',
  StartsWith = 'StartsWith',
  EndsWith = 'EndsWith',
}

interface FieldMatches {
  [MatchMethod.EmptyMatch]: FieldMatch;
  [MatchMethod.WildardMatch]: FieldMatch;
  [MatchMethod.ExactMatch]: Record<CandidateValue, FieldMatch>;
  [MatchMethod.StartsWith]: Record<CandidateValue, FieldMatch>;
  [MatchMethod.EndsWith]: Record<CandidateValue, FieldMatch>;
}

export class PayloadQueryProcessor implements QueryProcessor {
  private queries: Record<QueryId, Query>;
  // Map searched fields to searched values to corresponding query ids
  private fields: Record<Field, FieldMatches>;

  private wildcard: FieldMatch;

  constructor() {
    this.queries = {};
    this.fields = {};
    this.wildcard = {
      queries: [],
    };
  }

  type() {
    return QueryType.PayloadQuery;
  }

  removeQuery(id: string) {
    if (this.queries[id]) {
      this.queries[id].fieldMatches.forEach((fieldMatch) => {
        fieldMatch.queries = fieldMatch.queries.filter(
          (cur) => !cur.startsWith(`${id}_`)
        );
      });
    }
  }

  saveQuery(id: string, orQuery: OrQuery): void {
    this.removeQuery(id);

    if (!Array.isArray(orQuery)) {
      orQuery = [orQuery];
    }

    const query: Query = {
      orQuery: {},
      fieldMatches: [],
    };

    // Each match of the given OR filters
    let orIdx = -1;
    for (let orTerm of orQuery) {
      orIdx++;
      // Build unique query Id per OR - AND entry
      let queryId = `${id}_${orIdx}`;
      query.orQuery[queryId] = {
        queryId,
        fields: new Set(),
      };

      if (Object.keys(orTerm).length === 0) {
        // Empty query object = match everything
        this.wildcard.queries.push(queryId);
        query.fieldMatches.push(this.wildcard);
        query.orQuery[queryId].fields.add('*');
      } else {
        // Each field of the current AND match
        const matchFields = Object.entries(orTerm);

        for (let [field, value] of matchFields) {
          query.orQuery[queryId].fields.add(field);
          query.fieldMatches.push(
            ...this.addFieldMatch(field, value as any, queryId)
          );
        }
      }
    }

    this.queries[id] = query;
  }

  private addFieldMatch(field: string, value: any[], queryId: string) {
    if (!this.fields[field]) {
      this.fields[field] = {
        [MatchMethod.EmptyMatch]: { queries: [] },
        [MatchMethod.WildardMatch]: { queries: [] },
        [MatchMethod.ExactMatch]: {},
        [MatchMethod.StartsWith]: {},
        [MatchMethod.EndsWith]: {},
      };
    }
    if (!Array.isArray(value)) {
      value = [value];
    }

    const updatedFieldMatches: FieldMatch[] = [];
    value.forEach((curValue) => {
      if (curValue === '' || curValue === null || curValue === undefined) {
        this.fields[field][MatchMethod.EmptyMatch].queries.push(queryId);
        updatedFieldMatches.push(this.fields[field][MatchMethod.EmptyMatch]);
      } else if (curValue === '*') {
        this.fields[field][MatchMethod.WildardMatch].queries.push(queryId);
        updatedFieldMatches.push(this.fields[field][MatchMethod.WildardMatch]);
      } else {
        let method = MatchMethod.ExactMatch;
        if (typeof curValue === 'string' && curValue[0] === '*') {
          curValue = curValue.slice(1);
          method = MatchMethod.EndsWith;
        } else if (
          typeof curValue === 'string' &&
          curValue[curValue.length - 1] === '*'
        ) {
          curValue = curValue.slice(0, -1);
          method = MatchMethod.StartsWith;
        }
        if (!this.fields[field][method][curValue]) {
          this.fields[field][method][curValue] = { queries: [] };
        }
        this.fields[field][method][curValue].queries.push(queryId);
        updatedFieldMatches.push(this.fields[field][method][curValue]);
      }
    });

    return updatedFieldMatches;
  }

  matches(data: any): string[] {
    let matchingQueries: string[] = [...this.wildcard.queries];

    for (let [field, matchMethods] of Object.entries(this.fields)) {
      const dataFieldValue = extractObjectsByPath(data, field);

      // Empty match
      if (
        !dataFieldValue &&
        matchMethods?.[MatchMethod.EmptyMatch]?.queries?.length
      ) {
        matchingQueries.push(...matchMethods[MatchMethod.EmptyMatch].queries);
      }

      if (!dataFieldValue) {
        continue;
      }

      // Wildcard match
      if (matchMethods?.[MatchMethod.WildardMatch]?.queries?.length) {
        matchingQueries.push(...matchMethods[MatchMethod.WildardMatch].queries);
      }

      // Exact match
      if (
        matchMethods?.[MatchMethod.ExactMatch]?.[dataFieldValue]?.queries
          ?.length
      ) {
        matchingQueries.push(
          ...matchMethods[MatchMethod.ExactMatch][dataFieldValue].queries
        );
      }

      // StartsWith
      const startsWith =
        typeof dataFieldValue === 'string'
          ? Object.keys(matchMethods?.[MatchMethod.StartsWith] || {})
          : [];
      if (startsWith?.length) {
        startsWith.forEach((cur) => {
          if (dataFieldValue.startsWith(cur)) {
            matchingQueries.push(
              ...matchMethods[MatchMethod.StartsWith][cur].queries
            );
          }
        });
      }

      // EndsWith
      const endsWith =
        typeof dataFieldValue === 'string'
          ? Object.keys(matchMethods?.[MatchMethod.EndsWith] || {})
          : [];
      if (endsWith?.length) {
        endsWith.forEach((cur) => {
          if (dataFieldValue.endsWith(cur)) {
            matchingQueries.push(
              ...matchMethods[MatchMethod.EndsWith][cur].queries
            );
          }
        });
      }
    }

    const queriesByCandidate = matchingQueries.reduce<
      Record<string, Record<string, number>>
    >((mapping, queryId) => {
      let orIdxSeparator = queryId.lastIndexOf('_');
      if (orIdxSeparator === -1) {
        // Should not hapen
        return mapping;
      }
      const candidateId = queryId.slice(0, orIdxSeparator);
      if (!mapping[candidateId]) {
        mapping[candidateId] = {};
      }
      mapping[candidateId][queryId] =
        (mapping[candidateId]?.[queryId] || 0) + 1;

      return mapping;
    }, {});

    const matchingCandidates = Object.entries(queriesByCandidate).reduce<
      string[]
    >((matchingCandidates, [candidateId, queries]) => {
      const isMatching = Object.entries(queries).some(
        ([queryId, matchingFilters]) => {
          const orTerm = this.queries?.[candidateId]?.orQuery[queryId];
          // By default, events coming from a socket are not sent to others sockets listening to the same session
          if (
            data?.source?.socketId &&
            orTerm.fields.has('source.sessionId') &&
            !orTerm.fields.has('source.socketId')
          ) {
            const { currentSocket: currentSocketOnly = true } =
              data?.target || {};
            if (
              currentSocketOnly &&
              !queryId.startsWith(`${data?.source?.socketId}_`)
            ) {
              return false;
            }
          }

          return orTerm?.fields?.size === matchingFilters;
        }
      );
      if (isMatching) {
        matchingCandidates.push(candidateId);
      }
      return matchingCandidates;
    }, []);

    return matchingCandidates;
  }
}
