import express, { Request, Response } from "express";
import { EventType } from "../../eda";
import { asyncRoute } from "../utils/async";

async function webhookHandler(
  {
    headers,
    originalUrl,
    method,
    logger,
    params: { workspaceId, automationId },
    body,
    broker,
  }: Request<PrismeaiAPI.AutomationWebhook.PathParameters>,
  res: Response
) {
  await broker.send<Prismeai.TriggeredWebhook["payload"]>(
    EventType.TriggeredWebhook,
    {
      workspaceId,
      automationId,
      originalUrl,
      method: <any>method,
      headers,
      payload: body,
    }
  );
  res.send();
}

const app = express.Router({ mergeParams: true });

app.use(`/:automationId`, asyncRoute(webhookHandler));

export default app;
