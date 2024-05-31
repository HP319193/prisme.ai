import http from 'http';
import { Server, Socket } from 'socket.io';
import {
  API_KEY_HEADER,
  AUTH_DATA_HEADER,
  SESSION_ID_HEADER,
  SOCKETIO_COOKIE_MAX_AGE,
  USER_ID_HEADER,
} from '../../../../config';
import { SocketCtx, WORKSPACE_NSP_PATTERN } from './types';
import { logger } from '../../../logger';
import { SocketHandler } from './SocketHandler';
import { Subscriptions } from '../../../services/events/subscriptions';
import { SearchOptions } from '../../../services/events/store';
import { sendEvent } from '../../../services/events';
import { PrismeError } from '../../../errors';
import { ExtendedError } from 'socket.io/dist/namespace';
import { fetchMe } from '@prisme.ai/permissions';
import { Broker } from '@prisme.ai/broker';

type SocketData = {
  handler: SocketHandler;
};
export async function getSocketioServer(httpServer: http.Server) {
  const io = new Server<any, any, any, SocketData>(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    cookie: {
      name: 'io',
      maxAge: SOCKETIO_COOKIE_MAX_AGE,
    },
  });

  return io;
}

export const getAuthenticationMiddleware = (broker: Broker) =>
  async function authenticationMiddleware(
    socket: Socket,
    next: (err?: ExtendedError) => void
  ) {
    logger.debug({
      msg: `Handling websocket ${socket.id} connection ...`,
    });
    const socketHandler = new SocketHandler(
      socket,
      extractSocketContext(socket) as Required<SocketCtx>,
      broker
    );
    socket.data = {
      handler: socketHandler,
    };

    if (socketHandler.userId) {
      return next();
    }

    // api-gateway HTTP authentication middlewares are never called when websocket are directly opened without a first http req, so we have to fetch /me with received token in order to authenticate user
    const authorizationHeader =
      socket.handshake.headers?.authorization ||
      // When connecting directly with websocket & not HTTP polling first, we find token here as browser's websockets cannot send headers
      // https://socket.io/docs/v4/client-options/#extraheaders
      socket.handshake?.auth?.authorization;
    if (!authorizationHeader) {
      return next(new Error('Missing authentication credentials'));
    }

    try {
      const user = await fetchMe({
        authorization: authorizationHeader,
      });
      if (user?.id!) {
        socketHandler.update({
          userId: user?.id,
          authData: user.authData || {},
          sessionId: user.sessionId,
        });

        return next();
      }

      if ((<any>user).message) {
        return next(new Error('AuthenticationError: ' + (<any>user).message));
      }
    } catch (err) {
      socketHandler.logger.error({
        msg: 'Failed verifying provided authentication',
        err,
      });
      return next(
        new Error(
          (<Error>err).message ||
            'Could not verify provided credentials, please try again later or initiate a new session.'
        )
      );
    }

    socketHandler.logger.error(
      'Disconnect socket with invalid authentication credentials'
    );
    return next(new Error(`Invalid authentication credentials`));
  };

export function extractSocketContext(socket: Socket): Partial<SocketCtx> {
  const [, workspaceId] = socket.nsp.name.match(WORKSPACE_NSP_PATTERN) || [];
  const query = Object.entries(socket.handshake.query || {}).reduce(
    (obj, [k, v]) =>
      ['EIO', 'transport', 't', 'b64'].includes(k)
        ? obj
        : {
            ...obj,
            [k]: v,
          },
    {}
  ) as PrismeaiAPI.EventsLongpolling.QueryParameters;
  let userId = socket.handshake.headers[USER_ID_HEADER] as string;
  const userIp = Array.isArray(socket.handshake.headers?.['x-forwarded-for'])
    ? socket.handshake.headers?.['x-forwarded-for'][0]
    : socket.handshake.headers?.['x-forwarded-for'] || socket.handshake.address;
  const sessionId = socket.handshake.headers[SESSION_ID_HEADER] as string;
  const apiKey = socket.handshake.headers[API_KEY_HEADER] as string;
  const socketId = socket.id;
  let authData: Prismeai.User['authData'];
  try {
    authData = socket.handshake.headers[AUTH_DATA_HEADER]
      ? JSON.parse(socket.handshake.headers[AUTH_DATA_HEADER] as string)
      : undefined;
  } catch {
    logger.error({
      msg: `Could not parse JSON from authData header '${AUTH_DATA_HEADER}'`,
      userId,
      socketId,
      authData: socket.handshake.headers[AUTH_DATA_HEADER],
    });
  }
  return {
    workspaceId,
    userId: userId,
    sessionId,
    apiKey,
    socketId,
    userIp,
    query,
    authData,
  };
}

export async function processMessage(
  socketHandler: SocketHandler,
  subscriptions: Subscriptions,
  type: string,
  payload: Prismeai.PrismeEvent | SearchOptions
) {
  const subscriber = socketHandler.subscriber!;
  const socket = socketHandler.socket!;
  try {
    if (type === 'event') {
      await sendEvent(
        socketHandler.workspaceId,
        payload as Prismeai.PrismeEvent,
        subscriber.accessManager,
        socketHandler.broker,
        {
          ip: socketHandler.userIp,
        }
      );
    } else if (type === 'filters') {
      await subscriptions.updateLocalSubscriber(subscriber, {
        filters: payload as SearchOptions,
      });
    } else if (
      type === 'reconnection' &&
      (<any>payload)?.socketId &&
      socketHandler.sessionId
    ) {
      const previousSocketId = subscriber.socketId;
      const allowed = await subscriptions.updateLocalSubscriber(subscriber, {
        socketId: (<any>payload).socketId,
      });
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
