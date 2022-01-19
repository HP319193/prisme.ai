import { PrismeEvent } from "@prisme.ai/broker";
import http from "http";
import { Server } from "socket.io";
import { USER_ID_HEADER } from "../../../config";
import { logger } from "../../logger";
import { Subscriptions } from "../../services/events/Subscriptions";

const WORKSPACE_PATH = /^\/v2\/workspaces\/([\w-_]+)\/events$/;

export function initWebsockets(httpServer: http.Server, events: Subscriptions) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  const workspaces = io.of(WORKSPACE_PATH);
  workspaces.on("connection", (socket) => {
    const [, workspaceId] = socket.nsp.name.match(WORKSPACE_PATH) || [];
    const userId = socket.handshake.headers[USER_ID_HEADER];
    if (!userId) {
      logger.error(
        "Cannot handle a websocket subscription to events without authenticated user id"
      );
      return;
    }
    const off = events.subscribe(workspaceId, {
      userId: userId as string,
      callback: (event: PrismeEvent<any>) => {
        socket.emit(event.type, event);
      },
    });

    socket.on("disconnect", off);
  });
}
