import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { AccessManager, SubjectType } from '../../permissions';
import { Apps, Workspaces } from '../../services';
import DSULStorage from '../../services/DSULStorage';
import { PrismeContext } from '../middlewares';
import { asyncRoute } from '../utils/async';

export default function init(workspacesStorage: DSULStorage) {
  async function uploadFileHandler(
    {
      context,
      body,
      accessManager,
      broker,
    }: Request<any, any, PrismeaiAPI.CreateWorkspace.RequestBody>,
    res: Response<PrismeaiAPI.CreateWorkspace.Responses.$200>
  ) {
    // body.id = nanoid(7);

    // const { workspaces } = getServices({
    //   context,
    //   accessManager,
    //   broker,
    // });
    // const result = await workspaces.createWorkspace(body);
    res.send([]);
  }

  async function getFileHandler(
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

  async function deleteFileHandler(
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

  async function listFilesHandler(
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

  app.post(`/`, asyncRoute(uploadFileHandler));
  // app.get(`/`, asyncRoute(listFilesHandler));
  // app.delete(`/:fileId`, asyncRoute(deleteFileHandler));
  // app.get(`/:fileId`, asyncRoute(getFileHandler));

  return app;
}
