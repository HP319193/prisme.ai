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
    params: { workspaceId, automationSlug },
  }: Request<PrismeaiAPI.GetAutomation.PathParameters>,
  res: Response<PrismeaiAPI.GetAutomation.Responses.$200>
) {
  const automations = services.workspaces(logger, context);
  const result = await automations.getAutomation(workspaceId, automationSlug);
  res.send(result);
}

async function updateAutomationHandler(
  {
    logger,
    context,
    params: { workspaceId, automationSlug },
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
    automationSlug,
    body
  );
  res.send(result);
}

async function deleteAutomationHandler(
  {
    logger,
    context,
    params: { workspaceId, automationSlug },
  }: Request<PrismeaiAPI.DeleteAutomation.PathParameters>,
  res: Response<PrismeaiAPI.DeleteAutomation.Responses.$200>
) {
  const automations = services.workspaces(logger, context);
  await automations.deleteAutomation(workspaceId, automationSlug);
  res.send({ slug: automationSlug });
}

const app = express.Router({ mergeParams: true });

app.post(`/`, asyncRoute(createAutomationHandler));
app.patch(`/:automationSlug`, asyncRoute(updateAutomationHandler));
app.delete(`/:automationSlug`, asyncRoute(deleteAutomationHandler));
app.get(`/:automationSlug`, asyncRoute(getAutomationHandler));

export default app;
