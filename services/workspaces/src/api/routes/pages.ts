import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import { AccessManager, Role } from '../../permissions';
import { Apps, Workspaces } from '../../services';
import DSULStorage from '../../services/DSULStorage';
import { PrismeContext } from '../middlewares';
import { asyncRoute } from '../utils/async';

export function initPagesBackoffice(
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
      params: { workspaceId },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.ListPages.PathParameters>,
    res: Response<PrismeaiAPI.ListPages.Responses.$200>
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
      params: { workspaceId, id },
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
    // Handle Legacy "slug" query
    const query =
      typeof workspaceId == 'undefined' ? { $or: [{ id }, { slug: id }] } : id;
    const page = await workspaces.pages.getPage(query as any);
    // Get blocks urls from workspace and apps
    const authorizedAccessManager = await accessManager.as({
      id: 'api',
      sessionId: 'adminSession',
      role: Role.SuperAdmin,
    });
    const { workspaces: workspacesAsRoot } = getServices({
      context,
      accessManager: authorizedAccessManager,
      broker,
    });
    const workspace = await workspacesAsRoot.getWorkspace(page.workspaceId!);
    const apps = await workspacesAsRoot.appInstances.list(page.workspaceId!);
    const detailedPage = workspaces.pages.getDetailedPage(
      page,
      workspace,
      apps
    );

    res.send(detailedPage);
  }

  async function updatePageHandler(
    {
      context,
      params: { workspaceId, id },
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
    const result = await workspaces.pages.updatePage(workspaceId, { id }, body);
    res.send(result);
  }

  async function deletePageHandler(
    {
      context,
      params: { id },
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
    const deleted = await workspaces.pages.deletePage(id);

    res.send(deleted);
  }

  const app = express.Router({ mergeParams: true });

  app.get(`/`, asyncRoute(listPagesHandler));
  app.post(`/`, asyncRoute(createPageHandler));
  app.patch(`/:id`, asyncRoute(updatePageHandler));
  app.delete(`/:id`, asyncRoute(deletePageHandler));
  app.get(`/:id`, asyncRoute(getPageHandler));

  return app;
}

export function initPagesPublic(
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

  async function getPageHandler(
    {
      context,
      params: { workspaceSlug, pageSlug },
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.GetPageBySlug.PathParameters &
        PrismeaiAPI.GetPageBySlug.PathParameters
    >,
    res: Response<PrismeaiAPI.GetPage.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const page = await workspaces.pages.getPage({
      workspaceSlug,
      slug: pageSlug,
    });
    // Get blocks urls from workspace and apps
    const authorizedAccessManager = await accessManager.as({
      id: 'api',
      sessionId: 'adminSession',
      role: Role.SuperAdmin,
    });
    const { workspaces: workspacesAsRoot } = getServices({
      context,
      accessManager: authorizedAccessManager,
      broker,
    });
    const workspace = await workspacesAsRoot.getWorkspace(page.workspaceId!);
    const apps = await workspacesAsRoot.appInstances.list(page.workspaceId!);
    const detailedPage = workspaces.pages.getDetailedPage(
      page,
      workspace,
      apps
    );

    res.send(detailedPage);
  }

  const app = express.Router({ mergeParams: true });

  app.get(`/:workspaceSlug/:pageSlug`, asyncRoute(getPageHandler));

  return app;
}
