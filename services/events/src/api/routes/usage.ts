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
      logger,
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
    try {
      const usage = await eventsStore.workspaceUsage(workspaceId, query);
      return res.send(usage);
    } catch (err) {
      // If this workspace doesn't have any ES index, log error & return empty results
      // Avoid recreating empty indices for inactive workspaces when their /usage route is automatically called (i.e billing)
      logger.warn({
        msg: `Could not retrieve usage from workspace ${workspaceId}`,
        err,
      });
      return res.send({
        workspaceId,
        beforeDate: query.beforeDate,
        afterDate: query.afterDate,
        total: {
          automationRuns: 0,
          transactions: 0,
          httpTransactions: 0,
          eventTransactions: 0,
          scheduleTransactions: 0,
          sessions: 0,
          users: 0,
        },
        apps: [],
      });
    }
  }

  const app = express.Router({ mergeParams: true });

  app.get(`/`, asyncRoute(<any>getWorkspaceUsageHandler));

  return app;
}
