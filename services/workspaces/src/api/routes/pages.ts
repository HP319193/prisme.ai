import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import { AccessManager, Role } from '../../permissions';
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
    const page = await workspaces.pages.getPage(id);

    // Get widgets urls from workspace and apps
    const authorizedAccessManager = await accessManager.as({
      id: 'api',
      role: Role.SuperAdmin,
    });
    const { workspaces: workspacesAsRoot } = getServices({
      context,
      accessManager: authorizedAccessManager,
      broker,
    });
    const workspace = await workspacesAsRoot.getWorkspace(workspaceId);
    const apps = await workspacesAsRoot.appInstances.list(workspaceId);

    const getWidgetDetails = (name: string) => {
      if (workspace.widgets && workspace.widgets[name]) {
        return { url: workspace.widgets[name].url };
      }
      const details = apps.reduce<{
        url: string;
        appInstance: string;
      } | null>((prev, { slug: appInstance, widgets }) => {
        if (prev) return prev;
        const found = widgets.find(
          ({ slug }) => `${appInstance}.${slug}` === name
        );
        return found
          ? {
              url: found.url || '',
              appInstance,
            }
          : null;
      }, null);
      return details || { url: '', appInstance: '' };
    };
    const detailedPage: Prismeai.DetailedPage = {
      ...page,
      widgets: page.widgets.map((widget) => ({
        ...widget,
        ...(widget.name
          ? getWidgetDetails(widget.name)
          : { url: '', appInstance: '' }),
      })),
    };

    res.send(detailedPage);
  }

  async function updatePageHandler(
    {
      context,
      params: { id },
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
    const result = await workspaces.pages.updatePage(id, body);
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
