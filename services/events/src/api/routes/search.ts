import express, { Request, Response } from 'express';
import {
  ELASTIC_SEARCH_FORBIDDEN_AGGS,
  ELASTIC_SEARCH_FORBIDDEN_MAX_DEPTH,
  ELASTIC_SEARCH_TIMEOUT,
} from '../../../config';
import { PrismeError, SearchError } from '../../errors';
import { ActionType, SubjectType } from '../../permissions';
import { EventsStore } from '../../services/events/store';
import { ElasticsearchStore } from '../../services/events/store/ElasticsearchStore';
import { asyncRoute } from '../utils/async';

export function initSearchRoutes(eventsStore: EventsStore) {
  // Some refacto to do the day we want to move from ES ...
  const elastic = eventsStore as ElasticsearchStore;

  async function getWorkspaceSearchHandler(
    {
      params: { workspaceId },
      body,
      accessManager,
    }: Request<
      PrismeaiAPI.Search.PathParameters,
      PrismeaiAPI.Search.Responses.$200,
      PrismeaiAPI.Search.RequestBody,
      any
    >,
    res: Response<PrismeaiAPI.Search.Responses.$200>
  ) {
    if (workspaceId && workspaceId.includes('*')) {
      throw new Error('Forbidden wildcard workspaceId');
    }
    const {
      limit = 100,
      page,
      query,
      aggs,
      sort,
      _source,
      runtime_mappings: runtimeMappings,
    } = body;
    if (aggs || runtimeMappings) {
      await accessManager.throwUnlessCan(
        ActionType.AggregateSearch,
        SubjectType.Workspace,
        workspaceId
      );
      validateElasticAggregation({ aggs });
    }
    try {
      const { hits, aggregations } = await elastic._search(
        workspaceId,
        { limit, page },
        {
          timeout: ELASTIC_SEARCH_TIMEOUT,
          query,
          aggs,
          sort,
          _source,
          runtime_mappings: runtimeMappings,
        }
      );
      return res.send({
        size: hits?.total?.value,
        documents: hits?.hits?.length
          ? await accessManager.filterSubjectsBy(
              ActionType.Read,
              SubjectType.Event,
              (hits?.hits || []).map((cur: any) => cur?._source)
            )
          : [],
        aggs: aggregations,
      });
    } catch (error) {
      if (error instanceof PrismeError) {
        throw error;
      }
      if ((<any>error)?.statusCode == 400) {
        throw new SearchError(
          'Could not execute search request',
          (<any>error)?.meta?.body?.error
        );
      }
      throw error;
    }
  }

  const app = express.Router({ mergeParams: true });

  app.post(`/`, asyncRoute(<any>getWorkspaceSearchHandler));

  return app;
}

function validateElasticAggregation(agg: any, depth = 0) {
  const { aggs: subAggs, ...curAggs } = agg || {};
  if (subAggs) {
    Object.entries(subAggs).forEach(([aggName, agg]) =>
      validateElasticAggregation(agg, depth + 1)
    );
  }
  const forbiddenKeyword = ELASTIC_SEARCH_FORBIDDEN_AGGS.find(
    (forbiddenKeyword) => forbiddenKeyword in curAggs
  );
  if (forbiddenKeyword) {
    throw new SearchError(
      `Can't process aggregations : keyword '${forbiddenKeyword}' is forbidden'`
    );
  }
  if (depth > ELASTIC_SEARCH_FORBIDDEN_MAX_DEPTH) {
    throw new SearchError(
      `Can't process aggregations : exceeds maximum depth of ${ELASTIC_SEARCH_FORBIDDEN_MAX_DEPTH}`
    );
  }
}
