import express, { Request, Response } from 'express';
import { ActionType, SubjectType } from '../../permissions';
import { sendEvent } from '../../services/events';
import {
  EventsStore,
  PayloadQuery,
  SearchOptions,
} from '../../services/events/store';
import { asyncRoute } from '../utils/async';

export function initEventsRoutes(eventsStore: EventsStore) {
  async function sendEventHandler(
    {
      ip,
      logger,
      body,
      params: { workspaceId },
      accessManager,
      broker,
    }: Request<any, any, PrismeaiAPI.SendWorkspaceEvent.RequestBody>,
    res: Response
  ) {
    logger.debug({ msg: 'Send events ' + body.events });

    const result = await Promise.all(
      body.events.map((event) =>
        sendEvent(workspaceId, event, accessManager, broker, {
          ip,
        })
      )
    );
    res.send(result);
  }

  async function searchEventsHandler(
    {
      params: { workspaceId },
      query,
      accessManager,
    }: Request<
      PrismeaiAPI.EventsLongpolling.PathParameters,
      PrismeaiAPI.EventsLongpolling.Responses.$200,
      any,
      PrismeaiAPI.EventsLongpolling.QueryParameters
    >,
    res: Response
  ) {
    const events = await eventsStore.search(
      workspaceId,
      cleanSearchQuery(query)
    );

    return res.send({
      result: {
        events: await accessManager.filterSubjectsBy(
          ActionType.Read,
          SubjectType.Event,
          events
        ),
      },
    });
  }

  const app = express.Router({ mergeParams: true });

  app.get(`/`, asyncRoute(searchEventsHandler));
  app.post(`/`, asyncRoute(sendEventHandler));

  return app;
}

export function cleanSearchQuery({
  types,
  afterDate,
  beforeDate,
  page,
  sort,
  limit,
  text,
  appInstanceDepth,
  ...payloadQuery
}: PrismeaiAPI.EventsLongpolling.QueryParameters): SearchOptions {
  const opts: SearchOptions = {
    afterDate,
    beforeDate,
    page,
    limit,
    text,
    sort,
    appInstanceDepth,
    payloadQuery: payloadQuery as PayloadQuery,
    types: types ? types.split(',') : undefined,
  };

  if (
    typeof appInstanceDepth !== 'number' &&
    typeof (payloadQuery as any)?.['source.appInstanceDepth'] === 'undefined'
  ) {
    opts.appInstanceDepth = 1;
  }

  return opts;
}
