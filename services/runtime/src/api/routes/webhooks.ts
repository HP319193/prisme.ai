import express, { Request, Response } from 'express';
import { EventType } from '../../eda';
import Runtime from '../../services/runtime';
import { asyncRoute } from '../utils/async';

export default function init(runtime: Runtime) {
  async function webhookHandler(
    req: Request<PrismeaiAPI.AutomationWebhook.PathParameters>,
    res: Response<PrismeaiAPI.AutomationWebhook.Responses.$200>
  ) {
    const {
      headers,
      method,
      query,
      logger,
      params: { workspaceId, automationSlug },
      body,
      broker,
    } = req;
    const DO_NOT_SEND_HEADERS = ['cookie', 'host'];
    const filteredHeaders = Object.entries(headers)
      .filter(
        ([k, v]) =>
          !k.toLowerCase().startsWith('x-') && !DO_NOT_SEND_HEADERS.includes(k)
      )
      .reduce(
        (obj, [k, v]) => ({
          ...obj,
          [k]: v,
        }),
        {}
      );

    const event = await broker.send<Prismeai.TriggeredWebhook['payload']>(
      EventType.TriggeredWebhook,
      {
        workspaceId,
        automationSlug,
        body,
        headers: filteredHeaders,
        method,
        query,
      }
    );
    const outputs = await runtime.processEvent(event, logger, broker);
    res.send(outputs?.[0]?.output || {});
  }

  const app = express.Router({ mergeParams: true });

  app.use(`/:automationSlug`, asyncRoute(webhookHandler));

  return app;
}
