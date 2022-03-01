import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { AccessManager, SubjectType } from '../../permissions';
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
      accessManager,
      broker,
    }: Request<PrismeaiAPI.GetWorkspace.PathParameters>,
    res: Response<PrismeaiAPI.GetWorkspace.Responses.$200>
  ) {
    const { workspaces } = getServices({
      context,
      accessManager,
      broker,
    });
    const result = await workspaces.getWorkspace(workspaceId);
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

  const app = express.Router();

  app.post(`/`, asyncRoute(createWorkspaceHandler));
  app.patch(`/:workspaceId`, asyncRoute(updateWorkspaceHandler));
  app.get(`/`, asyncRoute(getWorkspacesHandler));
  app.delete(`/:workspaceId`, asyncRoute(deleteWorkspaceHandler));
  app.get(`/:workspaceId`, asyncRoute(getWorkspaceHandler));

  return app;
}
