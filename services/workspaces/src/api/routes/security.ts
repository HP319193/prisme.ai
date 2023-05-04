import { Broker } from '@prisme.ai/broker';
import express, { Request, Response } from 'express';
import { AccessManager } from '../../permissions';
import { Security } from '../../services';
import { DSULStorage } from '../../services/DSULStorage';
import { PrismeContext } from '../middlewares';
import { asyncRoute } from '../utils/async';

export default function init(dsulStorage: DSULStorage) {
  const getServices = ({
    context,
    accessManager,
    broker,
  }: {
    context: PrismeContext;
    accessManager: Required<AccessManager>;
    broker: Broker;
  }) => {
    const security = new Security(
      accessManager,
      broker.child(context),
      dsulStorage
    );
    return { security };
  };

  async function getSecurityHandler(
    {
      context,
      params: { workspaceId },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.GetSecurity.PathParameters>,
    res: Response<PrismeaiAPI.GetSecurity.Responses.$200>
  ) {
    const { security } = getServices({ context, accessManager, broker });
    const result = await security.getSecurity(workspaceId);
    res.send(result);
  }

  async function getRolesHandler(
    {
      context,
      params: { workspaceId },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.GetRoles.PathParameters>,
    res: Response<PrismeaiAPI.GetRoles.Responses.$200>
  ) {
    const { security } = getServices({ context, accessManager, broker });
    const result = await security.getRoles(workspaceId);
    res.send(result);
  }

  async function updateSecurityHandler(
    {
      context,
      params: { workspaceId },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.UpdateSecurity.PathParameters,
      any,
      PrismeaiAPI.UpdateSecurity.RequestBody
    >,
    res: Response<PrismeaiAPI.UpdateSecurity.Responses.$200>
  ) {
    const { security } = getServices({ context, accessManager, broker });
    const result = await security.updateSecurity(workspaceId, body);
    res.send(result);
  }

  const app = express.Router({ mergeParams: true });

  app.get(`/`, asyncRoute(getSecurityHandler));
  app.put(`/`, asyncRoute(updateSecurityHandler));
  app.get(`/roles`, asyncRoute(getRolesHandler));

  return app;
}
