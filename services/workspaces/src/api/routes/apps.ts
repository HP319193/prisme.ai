import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import { AccessManager } from '../../permissions';
import { Apps, Workspaces } from '../../services';
import DSULStorage from '../../services/DSULStorage';
import { PrismeContext } from '../middlewares';
import { asyncRoute } from '../utils/async';

export default function init(
  workspacesStorage: DSULStorage,
  appsStorage: DSULStorage
) {
  const getServices = ({
    context,
    accessManager,
    broker,
  }: {
    context: PrismeContext;
    accessManager: Required<AccessManager>;
    broker: Broker;
  }) => {
    const apps = new Apps(accessManager, broker.child(context), appsStorage);
    const workspaces = new Workspaces(
      accessManager,
      apps,
      broker.child(context),
      workspacesStorage
    );
    return { apps, workspaces };
  };

  async function publishAppHandler(
    {
      context,
      body,
      accessManager,
      broker,
    }: Request<any, any, PrismeaiAPI.PublishApp.RequestBody>,
    res: Response<PrismeaiAPI.PublishApp.Responses.$200>
  ) {
    const { apps, workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const dsul = await workspaces.getWorkspace(body.workspaceId);
    const result = await apps.publishApp(body, dsul);
    res.send(result);
  }

  async function getAppHandler(
    {
      context,
      params: { appSlug },
      query: { version },
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.GetApp.PathParameters,
      any,
      any,
      PrismeaiAPI.GetApp.QueryParameters
    >,
    res: Response<PrismeaiAPI.GetApp.Responses.$200>
  ) {
    const { apps } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await apps.getApp(appSlug, version);
    res.send(result);
  }

  async function deleteAppHandler(
    {
      context,
      params: { appSlug },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.DeleteApp.PathParameters>,
    res: Response<PrismeaiAPI.DeleteApp.Responses.$200>
  ) {
    const { apps } = getServices({
      context,
      accessManager,
      broker,
    });
    await apps.deleteApp(appSlug);
    res.send({ id: appSlug });
  }

  async function listAppsHandler(
    {
      context,
      accessManager,
      query: { query, page, limit },
      broker,
    }: Request<any, any, any, PrismeaiAPI.SearchApps.QueryParameters>,
    res: Response<PrismeaiAPI.SearchApps.Responses.$200>
  ) {
    const { apps } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await apps.listApps(
      {
        query,
      },
      {
        pagination: {
          page,
          limit,
        },
      }
    );
    res.send(result);
  }

  const app = express.Router();

  app.post(`/`, asyncRoute(publishAppHandler));
  app.get(`/`, asyncRoute(listAppsHandler));
  app.delete(`/:appSlug`, asyncRoute(deleteAppHandler));
  app.get(`/:appSlug`, asyncRoute(getAppHandler));

  return app;
}
