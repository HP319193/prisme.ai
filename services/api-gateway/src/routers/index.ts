import express from "express";
import initPipelines from "../pipelines";
import { GatewayConfig } from "../config";
import errorHandler from "../middlewares/errorHandler";
import { requestDecorator } from "../middlewares/traceability";
import httpLogger from "../middlewares/httpLogger";

export default async function initRouters(
  app: express.Application,
  gtwcfg: GatewayConfig
) {
  app.use(requestDecorator);
  app.use(httpLogger);
  await initPipelines(app, gtwcfg);
  app.use(errorHandler);

  app.get("/", (req: any, res: any) => {
    res.send(`Prisme.ai API Gateway`);
  });
}
