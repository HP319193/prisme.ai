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
        sendEvent(workspaceId, event, accessManager, broker)
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

  async function searchEventsValuesHandler(
    {
      params: { workspaceId },
      query: { fields, ...query },
      accessManager,
    }: Request<
      PrismeaiAPI.EventsValues.PathParameters,
      PrismeaiAPI.EventsValues.Responses.$200,
      any,
      PrismeaiAPI.EventsValues.QueryParameters
    >,
    res: Response<PrismeaiAPI.EventsValues.Responses.$200>
  ) {
    await accessManager.throwUnlessCan(
      ActionType.GetValues,
      SubjectType.Event,
      {
        source: { workspaceId },
      } as Prismeai.PrismeEvent
    );

    const requestedFields = (fields as string)
      .split(',')
      .map((cur) => cur.trim())
      .filter(Boolean);

    const result = await eventsStore.values(
      workspaceId,
      cleanSearchQuery(query),
      requestedFields
    );

    return res.send({
      result,
    });
  }

  const app = express.Router({ mergeParams: true });

  app.get(`/`, asyncRoute(searchEventsHandler));
  app.post(`/`, asyncRoute(sendEventHandler));
  app.get(`/values`, asyncRoute(<any>searchEventsValuesHandler));

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
