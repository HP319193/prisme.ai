import express, { Request, Response } from 'express';
import { ELASTIC_SEARCH_TIMEOUT } from '../../../config';
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
    const { limit = 100, page, query, aggs } = body;
    if (aggs) {
      await accessManager.throwUnlessCan(
        ActionType.AggregateSearch,
        SubjectType.Workspace,
        workspaceId
      );
    }
    try {
      const { hits, aggregations } = await elastic._search(
        workspaceId,
        { limit, page },
        {
          timeout: ELASTIC_SEARCH_TIMEOUT,
          query,
          aggs,
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
