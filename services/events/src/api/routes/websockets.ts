import { Broker } from '@prisme.ai/broker';
import http from 'http';
import { Server } from 'socket.io';
//@ts-ignore Dunno why, but typings not found in CI
import { createAdapter } from '@socket.io/redis-streams-adapter';
import { createClient } from '@redis/client';
import {
  API_KEY_HEADER,
  APP_NAME,
  AUTH_DATA_HEADER,
  SESSION_ID_HEADER,
  SOCKETIO_COOKIE_MAX_AGE,
  SOCKETIO_REDIS_HOST,
  SOCKETIO_REDIS_PASSWORD,
  USER_ID_HEADER,
} from '../../../config';
import { logger } from '../../logger';
import sendEvent from '../../services/events/send';
import { SearchOptions } from '../../services/events/store';
import {
  LocalSubscriber,
  Subscriptions,
} from '../../services/events/subscriptions';
import { cleanSearchQuery } from './events';
import { fetchMe } from '@prisme.ai/permissions';
import { PrismeError } from '../../errors';

const WORKSPACE_NSP_PATTERN = /^\/v2\/workspaces\/([\w-_]+)\/events$/;
const getWorkspaceNsp = (workspaceId: string) =>
  `/v2/workspaces/${workspaceId}/events`;

export async function initWebsockets(
  httpServer: http.Server,
  broker: Broker,
  subscriptions: Subscriptions
) {
  const redisWebsocketClient = createClient({
    url: SOCKETIO_REDIS_HOST,
    password: SOCKETIO_REDIS_PASSWORD,
    name: `${APP_NAME}-websockets`,
    pingInterval: 4 * 1000 * 60,
  });
  redisWebsocketClient.on('error', (err: Error) => {
    console.error(`Error occured with websockets redis pub client : ${err}`);
  });
  redisWebsocketClient.on('connect', () => {
    console.info('Websockets redis pub client connected.');
  });
  redisWebsocketClient.on('reconnecting', () => {
    console.info('Websockets redis pub client reconnecting ...');
  });
  redisWebsocketClient.on('ready', () => {
    console.info('Websockets redis pub client is ready.');
  });
  redisWebsocketClient.connect();

  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    cookie: {
      name: 'io',
      maxAge: SOCKETIO_COOKIE_MAX_AGE,
    },
    adapter: createAdapter(redisWebsocketClient) as any,
  });

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
    let userId = socket.handshake.headers[USER_ID_HEADER];
    if (!userId) {
      // api-gateway HTTP authentication middlewares are never called when websocket are directly opened without a first http req, so we have to fetch /me with received token in order to authenticate user
      const user = socket.handshake.headers?.authorization
        ? await fetchMe({
            authorization: socket.handshake.headers.authorization,
          })
        : undefined;
      if (user?.id!) {
        userId = user?.id;
        socket.handshake.headers[AUTH_DATA_HEADER] = JSON.stringify(
          user.authData || {}
        );
        socket.handshake.headers[SESSION_ID_HEADER] = user.sessionId;
      } else {
        logger.error(
          'Cannot handle a websocket subscription to events without an authenticated user'
        );
        return;
      }
    }
    const sessionId = socket.handshake.headers[SESSION_ID_HEADER];
    const apiKey = socket.handshake.headers[API_KEY_HEADER];
    const socketId = socket.id;
    const logsCtx = {
      userId,
      sessionId,
      workspaceId,
      socketId,
      'user-agent': socket.handshake.headers['user-agent'],
      referer: socket.handshake.headers['referer'],
    };

    let authData: Prismeai.User['authData'];
    try {
      authData = JSON.parse(
        socket.handshake.headers[AUTH_DATA_HEADER] as string
      );
    } catch {
      logger.error({
        msg: `Could not parse JSON from authData header '${AUTH_DATA_HEADER}'`,
        ...logsCtx,
      });
    }

    let subscription: LocalSubscriber;
    const ready = subscriptions
      .subscribe(workspaceId, {
        workspaceId,
        userId: userId as string,
        sessionId: sessionId as string,
        apiKey: apiKey as string,
        authData,
        socketId,
        filters: cleanSearchQuery(query),
      })
      .then((suscribed) => {
        subscription = suscribed;
        return true;
      })
      .catch((err) => {
        socket.disconnect();
        logger.warn({
          msg: 'Disconnect websocket',
          ...logsCtx,
          err,
        });
        return false;
      });

    logger.info({
      msg:
        'Websocket connected.' +
        ((<any>socket).recovered ? ' (RECOVERED)' : ''),
      ...logsCtx,
    });

    // Handle events creation
    const userIp = Array.isArray(socket.handshake.headers?.['x-forwarded-for'])
      ? socket.handshake.headers?.['x-forwarded-for'][0]
      : socket.handshake.headers?.['x-forwarded-for'] ||
        socket.handshake.address;
    let childBroker = broker.child({
      workspaceId,
      userId: userId as string,
      sessionId: sessionId as string,
      socketId,
      ip: userIp,
    });
    socket.onAny(
      async (type, payload: Prismeai.PrismeEvent | SearchOptions) => {
        logger.trace({
          msg: `Socket ${subscription?.socketId} sending ${type}`,
          ...logsCtx,
        });
        const isReady = await ready;
        if (!isReady) {
          return;
        }
        try {
          if (type === 'event') {
            await sendEvent(
              workspaceId,
              payload as Prismeai.PrismeEvent,
              subscription.accessManager,
              childBroker,
              {
                ip: userIp,
              }
            );
          } else if (type === 'filters') {
            await subscriptions.updateLocalSubscriber(subscription, {
              filters: payload as SearchOptions,
            });
          } else if (
            type === 'reconnection' &&
            (<any>payload)?.socketId &&
            sessionId
          ) {
            const previousSocketId = subscription.socketId;
            const allowed = await subscriptions.updateLocalSubscriber(
              subscription,
              {
                socketId: (<any>payload).socketId,
              }
            );
            if (!allowed) {
              logger.warn({
                msg: `Detected an attempt to reconnect with a forbidden socketId !`,
                userId,
                sessionId,
                socketId,
              });
              return;
            }

            logsCtx.socketId = (<any>payload).socketId;
            socket.leave(previousSocketId);
            socket.join(logsCtx.socketId);
            childBroker = broker.child({
              workspaceId,
              userId: userId as string,
              sessionId: sessionId as string,
              socketId: subscription.socketId,
              ip: userIp,
            });
            logger.info({
              msg: 'Websocket reconnected with its previous socketId.',
              ...logsCtx,
              previousSocketId,
            });
          }
        } catch (err) {
          logger.error({
            msg: 'An error raised while trying to send event from websocket',
            event: payload,
            userId,
            sessionId,
            err,
          });
          socket.emit('error', PrismeError.prototype.toJSON.apply(err));
        }
      }
    );

    socket.on('disconnect', (reason) => {
      logger.info({
        msg: `Websocket disconnected (${reason})`,
        ...logsCtx,
      });
      if (subscription) {
        subscription.unsubscribe();
      }
    });
    socket.on('connect', async () => {
      logger.info({
        msg: 'Websocket connected.',
        ...logsCtx,
      });
      socket.join(socket.id);
    });
    socket.on('reconnect', () => {
      logger.info({
        msg: 'Websocket reconnected !',
        ...logsCtx,
      });
    });
    socket.on('reconnect_attempt', (attempt) => {
      logger.info({
        msg: `Websocket reconnection attempt ${attempt}`,
        ...logsCtx,
      });
    });
    socket.on('reconnect_failed', (attempt) => {
      logger.warn({
        msg: `Websocket could not reconnect`,
        ...logsCtx,
      });
    });
  });

  return workspaces as any as Server;
}
