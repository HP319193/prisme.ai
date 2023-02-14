import express, { Request, Response } from 'express';
import { ActionType, SubjectType } from '../../permissions';
import { EventsStore } from '../../services/events/store';
import { asyncRoute } from '../utils/async';

export function initUsageRoutes(eventsStore: EventsStore) {
  async function getWorkspaceUsageHandler(
    {
      params: { workspaceId },
      query,
      accessManager,
    }: Request<
      PrismeaiAPI.WorkspaceUsage.PathParameters,
      PrismeaiAPI.WorkspaceUsage.Responses.$200,
      any,
      PrismeaiAPI.WorkspaceUsage.QueryParameters
    >,
    res: Response<PrismeaiAPI.WorkspaceUsage.Responses.$200>
  ) {
    await accessManager.throwUnlessCan(
      ActionType.GetUsage,
      SubjectType.Workspace,
      workspaceId
    );
    const usage = await eventsStore.workspaceUsage(workspaceId, query);
    return res.send(usage);
  }

  const app = express.Router({ mergeParams: true });

  app.get(`/`, asyncRoute(<any>getWorkspaceUsageHandler));

  return app;
}
