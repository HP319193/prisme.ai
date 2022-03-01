import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
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

  async function createAutomationHandler(
    {
      context,
      params: { workspaceId },
      body,
      accessManager,
      broker,
    }: Request<any, any, PrismeaiAPI.CreateAutomation.RequestBody>,
    res: Response<PrismeaiAPI.CreateAutomation.Responses.$200>
  ) {
    const { workspaces } = getServices({ context, accessManager, broker });
    const result = await workspaces.automations.createAutomation(
      workspaceId,
      body
    );
    res.send(result);
  }

  async function getAutomationHandler(
    {
      context,
      params: { workspaceId, automationSlug },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.GetAutomation.PathParameters>,
    res: Response<PrismeaiAPI.GetAutomation.Responses.$200>
  ) {
    const { workspaces } = getServices({ context, accessManager, broker });
    const result = await workspaces.automations.getAutomation(
      workspaceId,
      automationSlug
    );
    res.send(result);
  }

  async function updateAutomationHandler(
    {
      context,
      params: { workspaceId, automationSlug },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.UpdateAutomation.PathParameters,
      any,
      PrismeaiAPI.CreateAutomation.RequestBody
    >,
    res: Response<PrismeaiAPI.CreateAutomation.Responses.$200>
  ) {
    const { workspaces } = getServices({ context, accessManager, broker });
    const result = await workspaces.automations.updateAutomation(
      workspaceId,
      automationSlug,
      body
    );
    res.send(result);
  }

  async function deleteAutomationHandler(
    {
      context,
      params: { workspaceId, automationSlug },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.DeleteAutomation.PathParameters>,
    res: Response<PrismeaiAPI.DeleteAutomation.Responses.$200>
  ) {
    const { workspaces } = getServices({ context, accessManager, broker });
    await workspaces.automations.deleteAutomation(workspaceId, automationSlug);
    res.send({ slug: automationSlug });
  }

  const app = express.Router({ mergeParams: true });

  app.post(`/`, asyncRoute(createAutomationHandler));
  app.patch(`/:automationSlug`, asyncRoute(updateAutomationHandler));
  app.delete(`/:automationSlug`, asyncRoute(deleteAutomationHandler));
  app.get(`/:automationSlug`, asyncRoute(getAutomationHandler));

  return app;
}
