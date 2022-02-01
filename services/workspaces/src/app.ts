"use strict";
import http from "http";
import { APP_NAME, PERMISSIONS_STORAGE_MONGODB_OPTIONS, PORT } from "../config";

import { initAPI } from "./api";
import { broker } from "./eda";
import { uncaughtExceptionHandler } from "./errors";
import "@prisme.ai/types";
import { initAccessManager } from "./permissions";

process.on("uncaughtException", uncaughtExceptionHandler);

async function exit() {
  await broker.close();
  process.exit(0);
}
process.on("SIGTERM", exit);
process.on("SIGINT", exit);

const accessManager = initAccessManager(PERMISSIONS_STORAGE_MONGODB_OPTIONS);
accessManager.start();

const app = initAPI(accessManager);

const httpServer = http.createServer(app);

httpServer.listen(PORT, function () {
  console.log(`${APP_NAME} listening on ${PORT}.`);
});
