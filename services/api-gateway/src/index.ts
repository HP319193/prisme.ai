import express from "express";
require("express-async-errors");
import helmet from "helmet";
import cors from "cors";
import { syscfg, GatewayConfig } from "./config";
import initRoutes from "./routes";
import { initMetrics } from "./metrics";
import { logger } from "./logger";
import "@prisme.ai/types";
import { closeStorage } from "./storage";
import { broker } from "./eda";

const app = express();
app.set("trust proxy", true);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors({ credentials: true, origin: true }));

let gtwcfg;
try {
  gtwcfg = new GatewayConfig(syscfg.GATEWAY_CONFIG);
} catch (e) {
  console.error({ ...(<object>e) });
  process.exit(1);
}

initMetrics(app);
initRoutes(app, gtwcfg);

app.listen(syscfg.PORT, () => {
  logger.info(`Running on port ${syscfg.PORT}`);
});

process.on("uncaughtException", gracefulShutdown);

async function gracefulShutdown() {
  await closeStorage();
  await broker.close();
  process.exit(0);
}
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
