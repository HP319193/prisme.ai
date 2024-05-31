import { Broker } from '@prisme.ai/broker';
import http from 'http';
import { Server } from 'socket.io';
import { logger } from '../../../logger';
import { SearchOptions } from '../../../services/events/store';
import { Subscriptions } from '../../../services/events/subscriptions';
import { cleanSearchQuery } from '../events';
import {
  getAuthenticationMiddleware,
  getSocketioServer,
  processMessage,
} from './socketioUtils';
import { WORKSPACE_NSP_PATTERN, getWorkspaceNsp } from './types';
import { dispatchSubscribedEvents } from './dispatchSubscribedEvents';

export async function initWebsockets(
  httpServer: http.Server,
  broker: Broker,
  subscriptions: Subscriptions
) {
  const io = await getSocketioServer(httpServer);
  const workspaces = io.of(WORKSPACE_NSP_PATTERN);

  // Authenticate sockets
  workspaces.use(getAuthenticationMiddleware(broker));
  // Initiate corresponding subscribers
  workspaces.use(async (socket, next) => {
    const socketHandler = socket?.data?.handler;
    if (!socketHandler?.userId) {
      return next(new Error(`Received a socket without authenticated handler`));
    }

    try {
      const subscribed = await subscriptions.subscribe(
        socketHandler.workspaceId,
        {
          workspaceId: socketHandler.workspaceId,
          userId: socketHandler.userId as string,
          sessionId: socketHandler.sessionId as string,
          apiKey: socketHandler.apiKey as string,
          authData: socketHandler.authData,
          socketId: socketHandler.socketId,
          filters: cleanSearchQuery(socketHandler.query),
          targetTopic: subscriptions.cluster.localTopic,
        }
      );
      if (socketHandler.disconnected) {
        socketHandler.logger.debug({
          msg: `Websocket disconnected before subscriber readiness.`,
        });
        subscribed.unsubscribe();
        return;
      }

      socketHandler.logger.debug({
        msg: `Websocket's subscriber ready. Starting to process messages`,
      });
      socketHandler.subscriber = subscribed;
      next();
    } catch (err) {
      next(new Error('Internal error : please try again later.'));
      socketHandler.logger.error({
        msg: 'Disconnect websocket : could not instantiate subscriber',
        err,
      });
    }
  });

  // Start dispatching subscribed events to websockets
  dispatchSubscribedEvents(broker, subscriptions, (event, rooms) => {
    const nsp = event?.source?.workspaceId
      ? io.of(getWorkspaceNsp(event.source.workspaceId))
      : workspaces;
    nsp.to(rooms).emit(event?.type, event);
    logger.debug({
      msg: `Instance ${broker.consumer?.name} forwarded event ${event?.type} to ${rooms.length} rooms`,
      rooms,
    });
  });

  // Start listening to new subscribers
  workspaces.on('connection', async (socket) => {
    const socketHandler = socket.data.handler!;
    if (!socketHandler?.userId || !socketHandler.subscriber) {
      socket.disconnect();
      logger.error({
        msg: `Received a socket without authenticated user or subscriber`,
        socketId: socket.id,
      });
      return;
    }
    socketHandler.logger.info({
      msg:
        'Websocket connected.' +
        ((<any>socket).recovered ? ' (RECOVERED)' : ''),
    });

    // Listen to incoming message
    socket.onAny(
      async (type, payload: Prismeai.PrismeEvent | SearchOptions) => {
        socketHandler.logger.trace({
          msg: `Socket ${socketHandler.socketId} sending ${type} ${
            (payload as Prismeai.PrismeEvent)?.type || ''
          }`,
        });

        processMessage(socketHandler, subscriptions, type, payload);
      }
    );
  });

  return { io, workspacesNs: workspaces as any as Server };
}
