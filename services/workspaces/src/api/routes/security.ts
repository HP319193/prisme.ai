import express, { Request, Response } from 'express';
import { ApiKeys, Secrets, Security } from '../../services';
import { DSULStorage } from '../../services/DSULStorage';
import { asyncRoute } from '../utils/async';

export default function init(dsulStorage: DSULStorage) {
  async function getSecurityHandler(
    {
      context,
      params: { workspaceId },
      accessManager,
      broker,
    }: Request<PrismeaiAPI.GetSecurity.PathParameters>,
    res: Response<PrismeaiAPI.GetSecurity.Responses.$200>
  ) {
    const security = new Security(
      accessManager,
      broker.child(context),
      dsulStorage
    );
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
    const security = new Security(
      accessManager,
      broker.child(context),
      dsulStorage
    );
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
    const security = new Security(
      accessManager,
      broker.child(context),
      dsulStorage
    );
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
    const apiKeys = new ApiKeys(accessManager, broker.child(context));
    const data = await apiKeys.listApiKeys(workspaceId);
    return res.send(data as PrismeaiAPI.ListApiKeys.Responses.$200);
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
    const apiKeys = new ApiKeys(accessManager, broker.child(context));
    const data = await apiKeys.createApiKey(workspaceId, body);
    return res.send(data as Prismeai.ApiKey);
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
    const apiKeys = new ApiKeys(accessManager, broker.child(context));
    const updatedApiKey = await apiKeys.updateApiKey(workspaceId, apiKey, body);

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
    const apiKeys = new ApiKeys(accessManager, broker.child(context));
    await apiKeys.deleteApiKey(workspaceId, apiKey);

    return res.send({ apiKey });
  }

  /*
   * Secrets
   */
  async function getSecretsHandler(
    {
      context,
      broker,
      params: { workspaceId },
      accessManager,
    }: Request<
      PrismeaiAPI.GetWorkspaceSecrets.PathParameters,
      PrismeaiAPI.GetWorkspaceSecrets.Responses.$200,
      any
    >,
    res: Response<PrismeaiAPI.GetWorkspaceSecrets.Responses.$200>
  ) {
    const secrets = new Secrets(accessManager, broker.child(context));
    const data = await secrets.getSecrets(workspaceId);
    return res.send(data as PrismeaiAPI.GetWorkspaceSecrets.Responses.$200);
  }

  async function updateSecretsHandler(
    {
      method,
      context,
      params: { workspaceId },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.UpdateWorkspaceSecrets.PathParameters,
      PrismeaiAPI.UpdateWorkspaceSecrets.Responses.$200,
      PrismeaiAPI.UpdateWorkspaceSecrets.RequestBody
    >,
    res: Response<PrismeaiAPI.UpdateWorkspaceSecrets.Responses.$200>
  ) {
    const secrets = new Secrets(accessManager, broker.child(context));
    const data = await secrets.updateSecrets(workspaceId, body, {
      mode: method.toLowerCase() as any,
    });

    return res.send(data);
  }

  async function deleteSecretHandler(
    {
      context,
      params: { workspaceId, secretName },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.DeleteWorkspaceSecret.PathParameters,
      PrismeaiAPI.DeleteWorkspaceSecret.Responses.$200
    >,
    res: Response<PrismeaiAPI.DeleteWorkspaceSecret.Responses.$200>
  ) {
    const secrets = new Secrets(accessManager, broker.child(context));
    const data = await secrets.deleteSecret(workspaceId, secretName);

    return res.send(data);
  }

  const app = express.Router({ mergeParams: true });

  app.get(`/`, asyncRoute(getSecurityHandler));
  app.put(`/`, asyncRoute(updateSecurityHandler));
  app.get(`/roles`, asyncRoute(getRolesHandler));

  app.get(`/apikeys`, asyncRoute(getApiKeysHandler));
  app.post(`/apikeys`, asyncRoute(createApiKeyHandler));
  app.put(`/apikeys/:apiKey`, asyncRoute(updateApiKeyHandler));
  app.delete(`/apikeys/:apiKey`, asyncRoute(deleteApiKeyHandler));

  app.get(`/secrets`, asyncRoute(getSecretsHandler));
  app.put(`/secrets`, asyncRoute(updateSecretsHandler));
  app.patch(`/secrets`, asyncRoute(updateSecretsHandler));
  app.delete(`/secrets/:secretName`, asyncRoute(deleteSecretHandler));

  return app;
}
