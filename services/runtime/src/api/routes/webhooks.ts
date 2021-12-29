import express, { Request, Response } from "express";
import { asyncRoute } from "../utils/async";

async function webhookHandler(
  {
    logger,
    params: { workspaceId, automationId },
  }: Request<PrismeaiAPI.AutomationWebhook.PathParameters>,
  res: Response
) {
  workspaceId;
  automationId;
  logger.info("ola");
  res.send();
}

const app = express.Router();

app.use(`/:automationId`, asyncRoute(webhookHandler));

export default app;
