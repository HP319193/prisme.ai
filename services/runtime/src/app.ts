"use strict";
import http from "http";
import {
  APP_NAME,
  CONTEXTS_CACHE,
  PORT,
  WORKSPACES_STORAGE_TYPE,
} from "../config";

import { app } from "./api";
import { broker } from "./eda";
import { uncaughtExceptionHandler } from "./errors";
import "@prisme.ai/types";
import Runtime from "./services/runtime";
import { Workspaces } from "./services/workspaces";
import { buildCache } from "./cache";

/**
 * The 'uncaughtException' event is emitted when an uncaught JavaScript exception
 * bubbles all the way back to the event loop omitting Express.js error handler.
 *
 * !!! WARNING !!!
 * It is not safe to resume normal operation after 'uncaughtException'.
 * @link https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly
 */
process.on("uncaughtException", uncaughtExceptionHandler);

async function exit() {
  await broker.close();
  process.exit(0);
}
process.on("SIGTERM", exit);
process.on("SIGINT", exit);

const httpServer = http.createServer(app);

(async function () {
  await broker.ready;
  const cache = await buildCache(CONTEXTS_CACHE);

  const workspaces = new Workspaces(WORKSPACES_STORAGE_TYPE, broker);
  const runtime = new Runtime(broker, workspaces, cache);

  runtime.start();
  workspaces.startLiveUpdates();
})();

httpServer.listen(PORT, function () {
  console.log(`${APP_NAME} listening on ${PORT}.`);
});
