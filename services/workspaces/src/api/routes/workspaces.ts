import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import { AccessManager } from '../../permissions';
import { AppInstances, Apps, Workspaces } from '../../services';
import { DSULStorage } from '../../services/DSULStorage';
import FileStorage from '../../services/FileStorage';
import { PrismeContext } from '../middlewares';
import { asyncRoute } from '../utils/async';

export default function init(
  dsulStorage: DSULStorage,
  uploadsStorage: FileStorage
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
    const workspaces = new Workspaces(
      accessManager,
      broker.child(context),
      dsulStorage
    );
    return { workspaces };
  };

  async function createWorkspaceHandler(
    {
      context,
      body,
      accessManager,
      broker,
    }: Request<any, any, PrismeaiAPI.CreateWorkspace.RequestBody>,
    res: Response<PrismeaiAPI.CreateWorkspace.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await workspaces.createWorkspace(body);
    res.send(result);
  }

  async function getWorkspaceHandler(
    {
      context,
      params: { workspaceId },
      query: { version },
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.GetWorkspace.PathParameters,
      any,
      any,
      PrismeaiAPI.GetWorkspace.QueryParameters
    >,
    res: Response<PrismeaiAPI.GetWorkspace.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const apps = new Apps(accessManager, broker.child(context), dsulStorage);
    const appInstances = new AppInstances(
      accessManager,
      broker.child(context),
      dsulStorage,
      apps
    );

    const workspace = await workspaces.getDetailedWorkspace(
      workspaceId,
      version
    );

    const workspaceAppInstances = await appInstances.getDetailedList(
      workspaceId
    );
    workspace.imports = workspaceAppInstances.reduce<
      Record<string, Prismeai.DetailedAppInstance>
    >(
      (appInstances, appInstance) =>
        ({
          ...appInstances,
          [appInstance.slug]: appInstance,
        } as any),
      {} as any
    );
    res.send(workspace);
  }

  async function updateWorkspaceHandler(
    {
      context,
      params: { workspaceId },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.UpdateWorkspace.PathParameters,
      any,
      PrismeaiAPI.CreateWorkspace.RequestBody
    >,
    res: Response<PrismeaiAPI.CreateWorkspace.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await workspaces.updateWorkspace(workspaceId, body);
    res.send(result);
  }

  async function deleteWorkspaceHandler(
    {
      context,
      params: { workspaceId },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.DeleteWorkspace.PathParameters>,
    res: Response<PrismeaiAPI.DeleteWorkspace.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    await workspaces.deleteWorkspace(workspaceId);
    await uploadsStorage.deleteWorkspace(accessManager, workspaceId);
    res.send({ id: workspaceId });
  }

  async function getWorkspacesHandler(
    {
      accessManager,
      query,
      context,
      broker,
    }: Request<any, any, any, PrismeaiAPI.GetWorkspaces.QueryParameters>,
    res: Response<PrismeaiAPI.GetWorkspaces.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await workspaces.findWorkspaces(query);
    res.send(result);
  }

  async function listWorkspaceVersionsHandler(
    {
      accessManager,
      params: { workspaceId },
      context,
      broker,
    }: Request<PrismeaiAPI.ListWorkspaceVersions.PathParameters, any, any, any>,
    res: Response<PrismeaiAPI.ListWorkspaceVersions.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const versions = await workspaces.listWorkspaceVersions(workspaceId);
    res.send(versions);
  }

  async function publishWorkspaceVersionHandler(
    {
      accessManager,
      params: { workspaceId },
      body,
      context,
      broker,
    }: Request<
      PrismeaiAPI.PublishWorkspaceVersion.PathParameters,
      any,
      PrismeaiAPI.PublishWorkspaceVersion.RequestBody,
      any
    >,
    res: Response<PrismeaiAPI.PublishWorkspaceVersion.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const version = await workspaces.publishWorkspaceVersion(workspaceId, body);
    res.send(version);
  }

  async function deleteWorkspaceVersionHandler(
    {
      accessManager,
      params: { workspaceId, versionId },
      context,
      broker,
    }: Request<PrismeaiAPI.DeleteWorkspaceVersion.PathParameters>,
    res: Response<PrismeaiAPI.DeleteWorkspaceVersion.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    await workspaces.deleteWorkspaceVersion(workspaceId, versionId);
    res.send({ id: versionId });
  }

  async function rollbackWorkspaceVersionHandler(
    {
      accessManager,
      params: { workspaceId, versionId },
      context,
      broker,
    }: Request<PrismeaiAPI.RollbackWorkspaceVersion.PathParameters>,
    res: Response<PrismeaiAPI.RollbackWorkspaceVersion.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const version = await workspaces.rollbackWorkspaceVersion(
      workspaceId,
      versionId
    );

    res.send(version);
  }

  async function duplicateWorkspaceHandler(
    {
      accessManager,
      params: { workspaceId, versionId },
      context,
      broker,
    }: Request<PrismeaiAPI.DuplicateWorkspaceVersion.PathParameters>,
    res: Response<PrismeaiAPI.DuplicateWorkspaceVersion.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const workspace = await workspaces.duplicateWorkspace(
      workspaceId,
      versionId
    );

    res.send(workspace);
  }

  const app = express.Router();

  app.post(`/`, asyncRoute(createWorkspaceHandler));
  app.patch(`/:workspaceId`, asyncRoute(updateWorkspaceHandler));
  app.get(`/`, asyncRoute(getWorkspacesHandler));
  app.delete(`/:workspaceId`, asyncRoute(deleteWorkspaceHandler));
  app.get(`/:workspaceId`, asyncRoute(getWorkspaceHandler));

  app.get(`/:workspaceId/versions`, asyncRoute(listWorkspaceVersionsHandler));
  app.post(
    `/:workspaceId/versions`,
    asyncRoute(publishWorkspaceVersionHandler)
  );
  app.delete(
    `/:workspaceId/versions/:versionId`,
    asyncRoute(deleteWorkspaceVersionHandler)
  );
  app.post(
    `/:workspaceId/versions/:versionId/rollback`,
    asyncRoute(rollbackWorkspaceVersionHandler)
  );
  app.post(
    `/:workspaceId/versions/:versionId/duplicate`,
    asyncRoute(duplicateWorkspaceHandler)
  );

  return app;
}
