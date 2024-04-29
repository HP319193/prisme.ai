import { Broker } from '@prisme.ai/broker';
import http from 'http';
import { Server } from 'socket.io';
import { logger } from '../../../logger';
import sendEvent from '../../../services/events/send';
import { SearchOptions } from '../../../services/events/store';
import { Subscriptions } from '../../../services/events/subscriptions';
import { cleanSearchQuery } from '../events';
import { fetchMe } from '@prisme.ai/permissions';
import { PrismeError } from '../../../errors';
import { extractSocketContext, getSocketioServer } from './socketioUtils';
import { SocketCtx, WORKSPACE_NSP_PATTERN, getWorkspaceNsp } from './types';
import { SocketHandler } from './SocketHandler';

export async function initWebsockets(
  httpServer: http.Server,
  broker: Broker,
  subscriptions: Subscriptions
) {
  const io = await getSocketioServer(httpServer);
  const workspaces = io.of(WORKSPACE_NSP_PATTERN);

  // Listen to platform generated events & send to the listening sockets
  subscriptions.start((event, subscribers) => {
    const nsp = event?.source?.workspaceId
      ? io.of(getWorkspaceNsp(event.source.workspaceId))
      : workspaces;
    const rooms = subscribers.map((cur) => cur.socketId);
    if (rooms.length) {
      nsp.to(rooms).emit(event.type, event);
    }
    logger.debug({
      msg: `Sending ${event.type} to ${rooms.length} rooms`,
      rooms,
    });
  });

  workspaces.on('connection', async (socket) => {
    logger.debug({
      msg: `Handling websocket ${socket.id} connection ...`,
    });
    const socketHandler = new SocketHandler(
      extractSocketContext(socket) as SocketCtx,
      broker
    );

    // Start queuing messages right away so we don't miss anything
    let pendingMessages: { type: string; payload: any }[] = [];
    async function processMessage(
      socketHandler: SocketHandler,
      type: string,
      payload: any
    ) {
      if (!socketHandler.subscriber) {
        pendingMessages.push({
          type,
          payload,
        });
        return;
      }

      try {
        if (type === 'event') {
          await sendEvent(
            socketHandler.workspaceId,
            payload as Prismeai.PrismeEvent,
            socketHandler.subscriber.accessManager,
            socketHandler.broker,
            {
              ip: socketHandler.userIp,
            }
          );
        } else if (type === 'filters') {
          await subscriptions.updateLocalSubscriber(socketHandler.subscriber, {
            filters: payload as SearchOptions,
          });
        } else if (
          type === 'reconnection' &&
          (<any>payload)?.socketId &&
          socketHandler.sessionId
        ) {
          const previousSocketId = socketHandler.subscriber.socketId;
          const allowed = await subscriptions.updateLocalSubscriber(
            socketHandler.subscriber,
            {
              socketId: (<any>payload).socketId,
            }
          );
          if (!allowed) {
            socketHandler.logger.warn({
              msg: `Detected an attempt to reconnect with a forbidden socketId !`,
              askedSocketId: (<any>payload).socketId,
            });
            return;
          }

          socketHandler.update({
            socketId: (<any>payload).socketId,
          });
          socket.leave(previousSocketId);
          socket.join((<any>payload).socketId);

          socketHandler.logger.info({
            msg: 'Websocket reconnected with its previous socketId.',
            previousSocketId,
          });
        }
      } catch (err) {
        socketHandler.logger.error({
          msg: 'An error raised while trying to send event from websocket',
          event: payload,
          err,
        });
        socket.emit('error', PrismeError.prototype.toJSON.apply(err));
      }
    }

    // Handle events creation
    socket.onAny(
      async (type, payload: Prismeai.PrismeEvent | SearchOptions) => {
        socketHandler.logger.trace({
          msg: `Socket ${socketHandler.socketId} sending ${type} ${
            (payload as Prismeai.PrismeEvent)?.type || ''
          }`,
        });

        processMessage(socketHandler, type, payload);
      }
    );
    socket.on('disconnect', (reason) => {
      socketHandler.logger.info({
        msg: `Websocket disconnected (${reason})`,
      });
      if (socketHandler.subscriber) {
        socketHandler.subscriber.unsubscribe();
      }
    });
    socket.on('connect', async () => {
      socketHandler.logger.info({
        msg: 'Websocket connected.',
      });
      socket.join(socketHandler.socketId);
    });
    socket.on('reconnect', () => {
      socketHandler.logger.info({
        msg: 'Websocket reconnected !',
      });
    });
    socket.on('reconnect_attempt', (attempt) => {
      socketHandler.logger.info({
        msg: `Websocket reconnection attempt ${attempt}`,
      });
    });
    socket.on('reconnect_failed', (attempt) => {
      socketHandler.logger.warn({
        msg: `Websocket could not reconnect`,
      });
    });

    if (!socketHandler.userId) {
      // api-gateway HTTP authentication middlewares are never called when websocket are directly opened without a first http req, so we have to fetch /me with received token in order to authenticate user
      const user = socket.handshake.headers?.authorization
        ? await fetchMe({
            authorization: socket.handshake.headers.authorization,
          })
        : undefined;
      if (user?.id!) {
        socketHandler.update({
          userId: user?.id,
          authData: user.authData || {},
          sessionId: user.sessionId,
        });
      } else {
        socketHandler.logger.error(
          'Cannot handle a websocket subscription to events without an authenticated user'
        );
        return;
      }
    }

    socketHandler.logger.info({
      msg:
        'Websocket connected.' +
        ((<any>socket).recovered ? ' (RECOVERED)' : ''),
    });

    subscriptions
      .subscribe(socketHandler.workspaceId, {
        workspaceId: socketHandler.workspaceId,
        userId: socketHandler.userId as string,
        sessionId: socketHandler.sessionId as string,
        apiKey: socketHandler.apiKey as string,
        authData: socketHandler.authData,
        socketId: socketHandler.socketId,
        filters: cleanSearchQuery(socketHandler.query),
      })
      .then((suscribed) => {
        socketHandler.subscriber = suscribed;
        pendingMessages.forEach((cur) => {
          processMessage(socketHandler, cur.type, cur.payload);
        });
        pendingMessages = [];
        return true;
      })
      .catch((err) => {
        socket.disconnect();
        socketHandler.logger.warn({
          msg: 'Disconnect websocket',
          err,
        });
        return false;
      });
  });

  return workspaces as any as Server;
}
