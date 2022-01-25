import express, { Request, Response } from "express";
import { EventType } from "../../eda";
import Runtime from "../../services/runtime";
import { asyncRoute } from "../utils/async";

export default function init(runtime: Runtime) {
  async function webhookHandler(
    {
      headers,
      originalUrl,
      method,
      logger,
      params: { workspaceId, automationSlug },
      body,
      broker,
    }: Request<PrismeaiAPI.AutomationWebhook.PathParameters>,
    res: Response
  ) {
    const event = await broker.send<Prismeai.TriggeredWebhook["payload"]>(
      EventType.TriggeredWebhook,
      {
        workspaceId,
        automationSlug,
        originalUrl,
        method: <any>method,
        headers,
        payload: body,
      }
    );
    const outputs = await runtime.processEvent(event, logger, broker);
    res.send({ result: outputs });
  }

  const app = express.Router({ mergeParams: true });

  app.use(`/:automationSlug`, asyncRoute(webhookHandler));

  return app;
}
