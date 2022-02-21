import express, { Request, Response } from 'express';
import services from '../../services';
import { asyncRoute } from '../utils/async';

async function publishAppHandler(
  {
    logger,
    context,
    body,
    accessManager,
  }: Request<any, any, PrismeaiAPI.PublishApp.RequestBody>,
  res: Response<PrismeaiAPI.PublishApp.Responses.$200>
) {
  const workspaces = services.workspaces(accessManager, logger, context);
  const apps = services.apps(accessManager, workspaces, logger, context);
  const result = await apps.publishApp(body);
  res.send(result);
}

async function getAppHandler(
  {
    logger,
    context,
    params: { appId },
    query: { version },
    accessManager,
  }: Request<
    PrismeaiAPI.GetApp.PathParameters,
    any,
    any,
    PrismeaiAPI.GetApp.QueryParameters
  >,
  res: Response<PrismeaiAPI.GetApp.Responses.$200>
) {
  const workspaces = services.workspaces(accessManager, logger, context);
  const apps = services.apps(accessManager, workspaces, logger, context);
  const result = await apps.getApp(appId, version);
  res.send(result);
}

async function deleteAppHandler(
  {
    logger,
    context,
    params: { appId },
    accessManager,
  }: Request<PrismeaiAPI.DeleteApp.PathParameters>,
  res: Response<PrismeaiAPI.DeleteApp.Responses.$200>
) {
  const workspaces = services.workspaces(accessManager, logger, context);
  const apps = services.apps(accessManager, workspaces, logger, context);
  await apps.deleteApp(appId);
  res.send({ id: appId });
}

async function listAppsHandler(
  {
    logger,
    context,
    accessManager,
  }: Request<any, any, any, PrismeaiAPI.SearchApps.QueryParameters>,
  res: Response<PrismeaiAPI.SearchApps.Responses.$200>
) {
  const workspaces = services.workspaces(accessManager, logger, context);
  const apps = services.apps(accessManager, workspaces, logger, context);
  const result = await apps.listApps();
  res.send(result);
}

const app = express.Router();

app.post(`/`, asyncRoute(publishAppHandler));
app.get(`/`, asyncRoute(listAppsHandler));
app.delete(`/:appId`, asyncRoute(deleteAppHandler));
app.get(`/:appId`, asyncRoute(getAppHandler));

export default app;
