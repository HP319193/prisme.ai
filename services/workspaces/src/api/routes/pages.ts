import express, { Request, Response } from 'express';
import { SubjectType, ActionType } from '../../permissions';
import services from '../../services';
import { asyncRoute } from '../utils/async';

async function createPageHandler(
  {
    logger,
    context,
    params: { workspaceId },
    body,
    accessManager,
  }: Request<any, any, PrismeaiAPI.CreatePage.RequestBody>,
  res: Response<PrismeaiAPI.CreatePage.Responses.$200>
) {
  await accessManager.throwUnlessCan(
    ActionType.Update,
    SubjectType.Workspace,
    workspaceId
  );
  const pages = services.workspaces(logger, context);
  const result = await pages.createPage(workspaceId, body);
  res.send(result);
}

async function getPageHandler(
  {
    logger,
    context,
    params: { workspaceId, pageSlug },
    accessManager,
  }: Request<PrismeaiAPI.GetPage.PathParameters>,
  res: Response<PrismeaiAPI.GetPage.Responses.$200>
) {
  await accessManager.throwUnlessCan(
    ActionType.Read,
    SubjectType.Workspace,
    workspaceId
  );
  const pages = services.workspaces(logger, context);
  const result = await pages.getPage(workspaceId, pageSlug);
  res.send(result);
}

async function updatePageHandler(
  {
    logger,
    context,
    params: { workspaceId, pageSlug },
    body,
    accessManager,
  }: Request<
    PrismeaiAPI.UpdatePage.PathParameters,
    any,
    PrismeaiAPI.CreatePage.RequestBody
  >,
  res: Response<PrismeaiAPI.CreatePage.Responses.$200>
) {
  await accessManager.throwUnlessCan(
    ActionType.Update,
    SubjectType.Workspace,
    workspaceId
  );
  const pages = services.workspaces(logger, context);
  const result = await pages.updatePage(workspaceId, pageSlug, body);
  res.send(result);
}

async function deletePageHandler(
  {
    logger,
    context,
    params: { workspaceId, pageSlug },
    accessManager,
  }: Request<PrismeaiAPI.DeletePage.PathParameters>,
  res: Response<PrismeaiAPI.DeletePage.Responses.$200>
) {
  await accessManager.throwUnlessCan(
    ActionType.Update,
    SubjectType.Workspace,
    workspaceId
  );
  const pages = services.workspaces(logger, context);
  const deleted = await pages.deletePage(workspaceId, pageSlug);

  res.send(deleted);
}

const app = express.Router({ mergeParams: true });

app.post(`/`, asyncRoute(createPageHandler));
app.patch(`/:pageSlug`, asyncRoute(updatePageHandler));
app.delete(`/:pageSlug`, asyncRoute(deletePageHandler));
app.get(`/:pageSlug`, asyncRoute(getPageHandler));

export default app;
