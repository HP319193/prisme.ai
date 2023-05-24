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

  /*
   * API Keys
   */
  async function getApiKeysHandler(
    {
      context,
      broker,
      params: { workspaceId },
      accessManager,
    }: Request<
      PrismeaiAPI.ListApiKeys.PathParameters,
      PrismeaiAPI.ListApiKeys.Responses.$200,
      any
    >,
    res: Response<PrismeaiAPI.ListApiKeys.Responses.$200>
  ) {
    const { security } = getServices({ context, accessManager, broker });
    const apiKeys = await security.listApiKeys(workspaceId);
    return res.send(apiKeys as PrismeaiAPI.ListApiKeys.Responses.$200);
  }

  async function createApiKeyHandler(
    {
      context,
      params: { workspaceId },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.CreateApiKey.PathParameters,
      PrismeaiAPI.CreateApiKey.Responses.$200,
      PrismeaiAPI.CreateApiKey.RequestBody
    >,
    res: Response<PrismeaiAPI.CreateApiKey.Responses.$200>
  ) {
    const { security } = getServices({ context, accessManager, broker });
    const apiKey = await security.createApiKey(workspaceId, body.rules);
    return res.send(apiKey as Prismeai.ApiKey);
  }

  async function updateApiKeyHandler(
    {
      context,
      params: { workspaceId, apiKey },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.UpdateApiKey.PathParameters,
      PrismeaiAPI.UpdateApiKey.Responses.$200,
      PrismeaiAPI.UpdateApiKey.RequestBody
    >,
    res: Response<PrismeaiAPI.UpdateApiKey.Responses.$200>
  ) {
    const { security } = getServices({ context, accessManager, broker });
    const updatedApiKey = await security.updateApiKey(
      workspaceId,
      apiKey,
      body.rules
    );

    return res.send(updatedApiKey as Prismeai.ApiKey);
  }

  async function deleteApiKeyHandler(
    {
      context,
      params: { apiKey, workspaceId },
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.DeleteApiKey.PathParameters,
      PrismeaiAPI.DeleteApiKey.Responses.$200,
      any
    >,
    res: Response<PrismeaiAPI.DeleteApiKey.Responses.$200>
  ) {
    const { security } = getServices({ context, accessManager, broker });
    await security.deleteApiKey(workspaceId, apiKey);

    return res.send({ apiKey });
  }

  const app = express.Router({ mergeParams: true });

  app.get(`/`, asyncRoute(getSecurityHandler));
  app.put(`/`, asyncRoute(updateSecurityHandler));
  app.get(`/roles`, asyncRoute(getRolesHandler));

  app.get(`/apikeys`, asyncRoute(getApiKeysHandler));
  app.post(`/apikeys`, asyncRoute(createApiKeyHandler));
  app.put(`/apikeys/:apiKey`, asyncRoute(updateApiKeyHandler));
  app.delete(`/apikeys/:apiKey`, asyncRoute(deleteApiKeyHandler));

  return app;
}
