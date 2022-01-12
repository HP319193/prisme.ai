"use strict";
import http from "http";
import { APP_NAME, PORT } from "../config";

import { app } from "./api";
import { broker } from "./eda";
import { uncaughtExceptionHandler } from "./errors";
import "@prisme.ai/types";

process.on("uncaughtException", uncaughtExceptionHandler);

async function exit() {
  await broker.close();
  process.exit(0);
}
process.on("SIGTERM", exit);
process.on("SIGINT", exit);

const httpServer = http.createServer(app);
httpServer.listen(PORT, function () {
  console.log(`${APP_NAME} listening on ${PORT}.`);
});
