import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import { MissingFieldError } from '../../errors';
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
    return { workspaces };
  };

  async function installAppHandler(
    {
      context,
      params: { workspaceId },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.InstallAppInstance.PathParameters,
      any,
      PrismeaiAPI.InstallAppInstance.RequestBody
    >,
    res: Response<PrismeaiAPI.InstallAppInstance.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    if (!body.slug) {
      throw new MissingFieldError(`Missing 'slug' field`, { field: 'slug' });
    }
    const appInstance = body as Prismeai.AppInstance & { slug: string };
    await workspaces.appInstances.installApp(workspaceId, appInstance);
    res.send(appInstance);
  }

  async function updateAppConfigHandler(
    {
      context,
      params: { workspaceId, slug },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.UpdateAppInstanceConfig.PathParameters,
      any,
      PrismeaiAPI.UpdateAppInstanceConfig.RequestBody,
      any
    >,
    res: Response<PrismeaiAPI.UpdateAppInstanceConfig.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const currentAppInstance = await workspaces.appInstances.get(
      workspaceId,
      slug
    );
    const updatedAppInstance = await workspaces.appInstances.configureApp(
      workspaceId,
      slug,
      {
        config: {
          ...currentAppInstance?.config,
          value: body,
        },
      }
    );
    res.send(updatedAppInstance);
  }

  async function configureAppHandler(
    {
      context,
      params: { workspaceId, slug },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.ConfigureAppInstance.PathParameters,
      any,
      PrismeaiAPI.ConfigureAppInstance.RequestBody,
      any
    >,
    res: Response<PrismeaiAPI.ConfigureAppInstance.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const appInstance = await workspaces.appInstances.configureApp(
      workspaceId,
      slug,
      body
    );
    res.send(appInstance);
  }

  async function uninstallAppHandler(
    {
      context,
      params: { workspaceId, slug },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.UninstallAppInstance.PathParameters>,
    res: Response<PrismeaiAPI.UninstallAppInstance.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    await workspaces.appInstances.uninstallApp(workspaceId, slug);
    res.send({ id: slug });
  }

  async function listAppInstancesHandler(
    {
      context,
      params: { workspaceId },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.ListAppInstances.PathParameters, any, any, any>,
    res: Response<PrismeaiAPI.ListAppInstances.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const appInstances = await workspaces.appInstances.list(workspaceId);
    res.send(appInstances);
  }

  async function getAppHandler(
    {
      context,
      params: { workspaceId, slug },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.GetAppInstance.PathParameters, any, any, any>,
    res: Response<PrismeaiAPI.GetAppInstance.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const appInstance = await workspaces.appInstances.get(workspaceId, slug);
    res.send(appInstance);
  }

  async function getAppConfigHandler(
    {
      context,
      params: { workspaceId, slug },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.GetAppInstanceConfig.PathParameters, any, any, any>,
    res: Response<PrismeaiAPI.GetAppInstanceConfig.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const appInstance = await workspaces.appInstances.get(workspaceId, slug);
    res.send(appInstance.config?.value || {});
  }

  const app = express.Router({ mergeParams: true });

  app.post(`/`, asyncRoute(installAppHandler));
  app.get(`/`, asyncRoute(listAppInstancesHandler));
  app.delete(`/:slug`, asyncRoute(uninstallAppHandler));
  app.patch(`/:slug`, asyncRoute(configureAppHandler));
  app.patch(`/:slug/config`, asyncRoute(updateAppConfigHandler));
  app.get(`/:slug`, asyncRoute(getAppHandler));
  app.get(`/:slug/config`, asyncRoute(getAppConfigHandler));

  return app;
}
