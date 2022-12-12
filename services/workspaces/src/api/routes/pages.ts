import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import { AccessManager, getSuperAdmin } from '../../permissions';
import { AppInstances, Apps, Pages } from '../../services';
import { DSULStorage } from '../../services/dsulStorage';
import { PrismeContext } from '../middlewares';
import { asyncRoute } from '../utils/async';

export { getServices as getPagesService };

const getServices = async ({
  context,
  accessManager,
  broker,
  dsulStorage,
}: {
  context: PrismeContext;
  accessManager: Required<AccessManager>;
  broker: Broker;
  dsulStorage: DSULStorage;
}) => {
  const apps = new Apps(
    await getSuperAdmin(accessManager as AccessManager),
    broker.child(context),
    dsulStorage
  );
  const appInstances = new AppInstances(
    accessManager,
    broker.child(context),
    dsulStorage,
    apps
  );
  const pages = new Pages(
    accessManager,
    broker.child(context),
    dsulStorage,
    appInstances
  );
  return { pages };
};

export function initPagesBackoffice(dsulStorage: DSULStorage) {
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
    const { pages } = await getServices({
      context,
      accessManager,
      broker,
      dsulStorage,
    });
    const result = await pages.createPage(workspaceId, body);
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
    const { pages } = await getServices({
      context,
      accessManager,
      broker,
      dsulStorage,
    });
    const result = await pages.list(workspaceId);
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
    const { pages } = await getServices({
      context,
      accessManager,
      broker,
      dsulStorage,
    });
    const detailedPage = await pages.getDetailedPage({ id });
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
    const { pages } = await getServices({
      context,
      accessManager,
      broker,
      dsulStorage,
    });
    const result = await pages.updatePage(workspaceId, id, body);
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
    const { pages } = await getServices({
      context,
      accessManager,
      broker,
      dsulStorage,
    });
    const deleted = await pages.deletePage(id);

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

export function initPagesPublic(dsulStorage: DSULStorage) {
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
    const { pages } = await getServices({
      context,
      accessManager,
      broker,
      dsulStorage,
    });
    const detailedPage = await pages.getDetailedPage({
      workspaceSlug,
      slug: pageSlug,
    });

    res.send(detailedPage);
  }

  const app = express.Router({ mergeParams: true });

  app.get(`/:workspaceSlug/:pageSlug`, asyncRoute(getPageHandler));

  return app;
}
