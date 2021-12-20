import express from "express";
require("express-async-errors");
import { syscfg, GatewayConfig } from "./config";
import initRouters from "./routers";
import { logger } from "./logger";

const app = express();

let gtwcfg;
try {
  gtwcfg = new GatewayConfig(syscfg.GATEWAY_CONFIG);
} catch (e) {
  console.error({ ...(<object>e) });
  process.exit(1);
}
initRouters(app, gtwcfg);

app.listen(syscfg.PORT, () => {
  logger.info(`Running on port ${syscfg.PORT}`);
});
