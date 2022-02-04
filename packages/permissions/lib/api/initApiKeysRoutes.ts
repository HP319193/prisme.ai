import "@prisme.ai/types";
import { Request, Response, Router } from "express";
import { asyncRoute, ExtendedRequest } from "./utils";

export enum EventType {
  CreatedApiKey = "apikeys.created",
  UpdatedApiKey = "apikeys.updated",
  DeletedApiKey = "apikeys.deleted",
}

export function initApiKeysRoutes<
  SubjectType extends string,
  CustomRules = any
>(app: Router) {
  async function getApiKeysHandler(
    {
      params: { subjectType, subjectId },
      accessManager,
    }: Request<
      PrismeaiAPI.ListApiKeys.PathParameters,
      PrismeaiAPI.ListApiKeys.Responses.$200,
      any
    > &
      ExtendedRequest<SubjectType, CustomRules>,
    res: Response<PrismeaiAPI.ListApiKeys.Responses.$200>
  ) {
    const apiKeys = await accessManager.findApiKeys(
      subjectType as SubjectType,
      subjectId
    );
    return res.send(apiKeys);
  }

  async function createApiKeyHandler(
    {
      params: { subjectType, subjectId },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.CreateApiKey.PathParameters,
      PrismeaiAPI.CreateApiKey.Responses.$200,
      PrismeaiAPI.CreateApiKey.RequestBody
    > &
      ExtendedRequest<SubjectType>,
    res: Response<PrismeaiAPI.CreateApiKey.Responses.$200>
  ) {
    const apiKey = await accessManager.createApiKey(
      subjectType as SubjectType,
      subjectId,
      body.rules
    );

    if (broker) {
      broker.send<Prismeai.CreatedApiKey["payload"]>(
        EventType.CreatedApiKey,
        <Prismeai.CreatedApiKey["payload"]>apiKey
      );
    }

    return res.send(apiKey);
  }

  async function updateApiKeyHandler(
    {
      params: { subjectType, subjectId, apiKey },
      body,
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.UpdateApiKey.PathParameters,
      PrismeaiAPI.UpdateApiKey.Responses.$200,
      PrismeaiAPI.UpdateApiKey.RequestBody
    > &
      ExtendedRequest<SubjectType>,
    res: Response<PrismeaiAPI.UpdateApiKey.Responses.$200>
  ) {
    const updatedApiKey = await accessManager.updateApiKey(
      apiKey,
      subjectType as SubjectType,
      subjectId,
      body.rules
    );

    if (broker) {
      broker.send<Prismeai.UpdatedApiKey["payload"]>(
        EventType.UpdatedApiKey,
        <Prismeai.UpdatedApiKey["payload"]>updatedApiKey
      );
    }

    return res.send(updatedApiKey);
  }

  async function deleteApiKeyHandler(
    {
      params: { apiKey, subjectType, subjectId },
      accessManager,
      broker,
    }: Request<
      PrismeaiAPI.DeleteApiKey.PathParameters,
      PrismeaiAPI.DeleteApiKey.Responses.$200,
      any
    > &
      ExtendedRequest<SubjectType>,
    res: Response<PrismeaiAPI.DeleteApiKey.Responses.$200>
  ) {
    await accessManager.deleteApiKey(
      apiKey,
      subjectType as SubjectType,
      subjectId
    );

    if (broker) {
      broker.send<Prismeai.DeletedApiKey["payload"]>(EventType.DeletedApiKey, {
        apiKey,
        subjectType:
          subjectType as Prismeai.DeletedApiKey["payload"]["subjectType"],
        subjectId,
      });
    }

    return res.send({ apiKey });
  }

  const baseRoute = "/v2/:subjectType/:subjectId/apiKeys";
  app.post(`${baseRoute}`, asyncRoute(createApiKeyHandler));
  app.get(`${baseRoute}`, asyncRoute(getApiKeysHandler));
  app.put(`${baseRoute}/:apiKey`, asyncRoute(updateApiKeyHandler));
  app.delete(`${baseRoute}/:apiKey`, asyncRoute(deleteApiKeyHandler));
}
