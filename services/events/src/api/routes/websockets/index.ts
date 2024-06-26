import { Broker } from '@prisme.ai/broker';
import http from 'http';
import { Server } from 'socket.io';
import { logger } from '../../../logger';
import { SearchOptions } from '../../../services/events/store';
import { Subscriptions } from '../../../services/events/subscriptions';
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

    // Handle previous socketId reuse
    if (socketHandler.reuseSocketId) {
      const allowed = await subscriptions.isAllowedSubscriberSocketId(
        socketHandler.workspaceId,
        socketHandler.sessionId,
        socketHandler.reuseSocketId
      );
      if (allowed) {
        socketHandler.logger.info({
          msg: 'Websocket reconnected with its previous socketId during authentication.',
          previousSocketId: socketHandler.reuseSocketId,
        });
        socketHandler.update({
          socketId: socketHandler.reuseSocketId,
        });
      } else {
        socketHandler.logger.info({
          msg: 'Websocket tried to reconnect with a forbidden/invalid previous socketId during authentication.',
          askedSocketId: socketHandler.reuseSocketId,
        });
      }
      delete socketHandler.reuseSocketId;
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
          filters: socketHandler.filters,
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
        msg: `Websocket's subscriber ready.`,
      });
      socketHandler.setSubscriber(subscribed);
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
        userId: socketHandler?.userId,
        hasSubscriber: !!socketHandler.subscriber,
      });
      return;
    }
    socketHandler.logger.info({
      msg:
        'Websocket authenticated ' +
        ((<any>socket).recovered ? ' (RECOVERED) : ' : ' : ') +
        'Starting to process messages',
      ...socketHandler.metrics,
      connectionDuration:
        socketHandler.metrics.authenticatedAt -
        socketHandler.metrics.connectedAt,
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
