import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import { SubjectType, ActionType, AccessManager } from '../../permissions';
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
    return { workspaces };
  };

  async function createPageHandler(
    {
      context,
      params: { workspaceId },
      body,
      accessManager,
      broker,
    }: Request<any, any, PrismeaiAPI.CreatePage.RequestBody>,
    res: Response<PrismeaiAPI.CreatePage.Responses.$200>
  ) {
    console.log('GOT REQUEST');
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await workspaces.pages.createPage(workspaceId, body);
    res.send(result);
  }

  async function listPagesHandler(
    {
      context,
      params: { workspaceId, pageSlug },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.GetPage.PathParameters>,
    res: Response<PrismeaiAPI.GetPage.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await workspaces.pages.list(workspaceId);
    res.send(result);
  }

  async function getPageHandler(
    {
      context,
      params: { workspaceId, pageSlug },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.GetPage.PathParameters>,
    res: Response<PrismeaiAPI.GetPage.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await workspaces.pages.getPage(workspaceId, pageSlug);
    res.send(result);
  }

  async function updatePageHandler(
    {
      context,
      params: { workspaceId, pageSlug },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.UpdatePage.PathParameters,
      any,
      PrismeaiAPI.CreatePage.RequestBody
    >,
    res: Response<PrismeaiAPI.CreatePage.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await workspaces.pages.updatePage(
      workspaceId,
      pageSlug,
      body
    );
    res.send(result);
  }

  async function deletePageHandler(
    {
      context,
      params: { workspaceId, pageSlug },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.DeletePage.PathParameters>,
    res: Response<PrismeaiAPI.DeletePage.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const deleted = await workspaces.pages.deletePage(workspaceId, pageSlug);

    res.send(deleted);
  }

  const app = express.Router({ mergeParams: true });

  app.get(`/`, asyncRoute(listPagesHandler));
  app.post(`/`, asyncRoute(createPageHandler));
  app.patch(`/:pageSlug`, asyncRoute(updatePageHandler));
  app.delete(`/:pageSlug`, asyncRoute(deletePageHandler));
  app.get(`/:pageSlug`, asyncRoute(getPageHandler));

  return app;
}
