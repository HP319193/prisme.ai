import express, { Request, Response } from 'express';
import { ActionType, SubjectType } from '../../permissions';
import services from '../../services';
import {
  EventsStore,
  PayloadQuery,
  SearchOptions,
} from '../../services/events/store';
import { asyncRoute } from '../utils/async';

export function initEventsRoutes(eventsStore: EventsStore) {
  async function sendEventHandler(
    {
      logger,
      context,
      body,
      params: { workspaceId },
      accessManager,
    }: Request<any, any, PrismeaiAPI.SendWorkspaceEvent.RequestBody>,
    res: Response
  ) {
    for (let event of body.events) {
      await accessManager.throwUnlessCan(ActionType.Create, SubjectType.Event, {
        ...event,
        source: { workspaceId },
      } as Prismeai.PrismeEvent);
    }
    const events = services.events(logger, context);

    const result = await Promise.all(body.events.map(events.sendEvent));
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
        events: accessManager.filterSubjectsBy(
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
  limit,
  text,
  ...payloadQuery
}: PrismeaiAPI.EventsLongpolling.QueryParameters): SearchOptions {
  return {
    afterDate,
    beforeDate,
    page,
    limit,
    text,
    payloadQuery: payloadQuery as PayloadQuery,
    types: types ? types.split(',') : undefined,
  };
}
