import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { EventType } from '../../eda';
import { AccessManager, SubjectType } from '../../permissions';
import { Apps, Workspaces } from '../../services';
import DSULStorage from '../../services/DSULStorage';
import FileStorage from '../../services/FileStorage';
import { PrismeContext } from '../middlewares';
import { asyncRoute } from '../utils/async';

export default function init(
  workspacesStorage: DSULStorage,
  appsStorage: DSULStorage,
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
    const apps = new Apps(accessManager, broker.child(context), appsStorage);
    const workspaces = new Workspaces(
      accessManager,
      apps,
      broker.child(context),
      workspacesStorage
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
    body.id = nanoid(7);

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
    const result = await workspaces.getWorkspace(workspaceId, version);
    res.send(result);
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
      query: { limit, page },
    }: Request<any, any, any, PrismeaiAPI.GetWorkspaces.QueryParameters>,
    res: Response<PrismeaiAPI.GetWorkspaces.Responses.$200>
  ) {
    const result = await accessManager.findAll(
      SubjectType.Workspace,
      {},
      {
        pagination: {
          limit,
          page,
        },
      }
    );
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
    const targetVersion = await workspaces.getWorkspace(workspaceId, versionId);
    const result = await workspaces.updateWorkspace(workspaceId, targetVersion);

    const availableVersions = await workspaces.listWorkspaceVersions(
      workspaceId
    );
    broker.send<Prismeai.RollbackWorkspaceVersion['payload']>(
      EventType.RollbackWorkspaceVersion,
      {
        version: availableVersions.find((cur) => cur.name == versionId) || {
          name: versionId,
          description: '',
        },
      }
    );

    res.send(result);
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

  return app;
}
