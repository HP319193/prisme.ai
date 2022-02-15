import { PrismeEvent } from '@prisme.ai/broker';
import http from 'http';
import { Server } from 'socket.io';
import { API_KEY_HEADER, USER_ID_HEADER } from '../../../config';
import { logger } from '../../logger';
import { Subscriptions } from '../../services/events/Subscriptions';

const WORKSPACE_PATH = /^\/v2\/workspaces\/([\w-_]+)\/events$/;

export function initWebsockets(httpServer: http.Server, events: Subscriptions) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  const workspaces = io.of(WORKSPACE_PATH);
  workspaces.on('connection', async (socket) => {
    const [, workspaceId] = socket.nsp.name.match(WORKSPACE_PATH) || [];
    const userId = socket.handshake.headers[USER_ID_HEADER];
    if (!userId) {
      logger.error(
        'Cannot handle a websocket subscription to events without authenticated user id'
      );
      return;
    }
    const apiKey = socket.handshake.headers[API_KEY_HEADER];
    const off = await events.subscribe(workspaceId, {
      userId: userId as string,
      apiKey: apiKey as string,
      callback: (event: PrismeEvent<any>) => {
        socket.emit(event.type, event);
      },
    });

    socket.on('disconnect', off);
  });
}
