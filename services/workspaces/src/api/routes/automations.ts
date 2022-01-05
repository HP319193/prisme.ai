import express, { Request, Response } from "express";
import services from "../../services";
import { asyncRoute } from "../utils/async";

async function createAutomationHandler(
  {
    logger,
    context,
    params: { workspaceId },
    body,
  }: Request<any, any, PrismeaiAPI.CreateAutomation.RequestBody>,
  res: Response<PrismeaiAPI.CreateAutomation.Responses.$200>
) {
  const automations = services.workspaces(logger, context);
  const result = await automations.createAutomation(workspaceId, body);
  res.send(result);
}

async function getAutomationHandler(
  {
    logger,
    context,
    params: { workspaceId, automationId },
  }: Request<PrismeaiAPI.GetAutomation.PathParameters>,
  res: Response<PrismeaiAPI.GetAutomation.Responses.$200>
) {
  const automations = services.workspaces(logger, context);
  const result = await automations.getAutomation(workspaceId, automationId);
  res.send(result);
}

async function updateAutomationHandler(
  {
    logger,
    context,
    params: { workspaceId, automationId },
    body,
  }: Request<
    PrismeaiAPI.UpdateAutomation.PathParameters,
    any,
    PrismeaiAPI.CreateAutomation.RequestBody
  >,
  res: Response<PrismeaiAPI.CreateAutomation.Responses.$200>
) {
  const automations = services.workspaces(logger, context);
  const result = await automations.updateAutomation(
    workspaceId,
    automationId,
    body
  );
  res.send(result);
}

async function deleteAutomationHandler(
  {
    logger,
    context,
    params: { workspaceId, automationId },
  }: Request<PrismeaiAPI.DeleteAutomation.PathParameters>,
  res: Response<PrismeaiAPI.DeleteAutomation.Responses.$200>
) {
  const automations = services.workspaces(logger, context);
  await automations.deleteAutomation(workspaceId, automationId);
  res.send({ id: automationId });
}

const app = express.Router({ mergeParams: true });

app.post(`/`, asyncRoute(createAutomationHandler));
app.patch(`/:automationId`, asyncRoute(updateAutomationHandler));
app.delete(`/:automationId`, asyncRoute(deleteAutomationHandler));
app.get(`/:automationId`, asyncRoute(getAutomationHandler));

export default app;
