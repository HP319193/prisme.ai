import express, { Request, Response } from "express";
import services from "../../services";
import { asyncRoute } from "../utils/async";

async function createWorkspaceHandler(
  {
    logger,
    context,
    body,
  }: Request<any, any, PrismeaiAPI.CreateWorkspace.RequestBody>,
  res: Response<PrismeaiAPI.CreateWorkspace.Responses.$200>
) {
  const workspaces = services.workspaces(logger, context);
  const result = await workspaces.createWorkspace(body);
  res.send(result);
}

async function getWorkspaceHandler(
  {
    logger,
    context,
    params: { workspaceId },
  }: Request<PrismeaiAPI.GetWorkspace.PathParameters>,
  res: Response<PrismeaiAPI.GetWorkspace.Responses.$200>
) {
  const workspaces = services.workspaces(logger, context);
  const result = await workspaces.getWorkspace(workspaceId);
  res.send(result);
}

async function updateWorkspaceHandler(
  {
    logger,
    context,
    params: { workspaceId },
    body,
  }: Request<
    PrismeaiAPI.UpdateWorkspace.PathParameters,
    any,
    PrismeaiAPI.CreateWorkspace.RequestBody
  >,
  res: Response<PrismeaiAPI.CreateWorkspace.Responses.$200>
) {
  const workspaces = services.workspaces(logger, context);
  const result = await workspaces.updateWorkspace(workspaceId, body);
  res.send(result);
}

async function deleteWorkspaceHandler(
  {
    logger,
    context,
    params: { workspaceId },
  }: Request<PrismeaiAPI.DeleteWorkspace.PathParameters>,
  res: Response<PrismeaiAPI.DeleteWorkspace.Responses.$200>
) {
  const workspaces = services.workspaces(logger, context);
  await workspaces.deleteWorkspace(workspaceId);
  res.send({ id: workspaceId });
}

async function getWorkspacesHandler(
  {
    logger,
    context,
    query,
  }: Request<any, any, any, PrismeaiAPI.GetWorkspaces.QueryParameters>,
  res: Response<PrismeaiAPI.GetWorkspaces.Responses.$200>
) {
  const workspaces = services.workspaces(logger, context);
  const result = await workspaces.getWorkspaces(query);
  res.send(result);
}

const app = express.Router();

app.post(`/`, asyncRoute(createWorkspaceHandler));
app.patch(`/:workspaceId`, asyncRoute(updateWorkspaceHandler));
app.get(`/`, asyncRoute(getWorkspacesHandler));
app.delete(`/:workspaceId`, asyncRoute(deleteWorkspaceHandler));
app.get(`/:workspaceId`, asyncRoute(getWorkspaceHandler));

export default app;
