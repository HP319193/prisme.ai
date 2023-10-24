import { PrismeEvent } from '@prisme.ai/broker';
import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
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
import { Subscriber, Subscriptions } from '../../services/events/Subscriptions';
import { cleanSearchQuery } from './events';
import { Cache } from '../../cache';
import { fetchMe } from '@prisme.ai/permissions';

const WORKSPACE_PATH = /^\/v2\/workspaces\/([\w-_]+)\/events$/;

export function initWebsockets(
  httpServer: http.Server,
  events: Subscriptions,
  cache: Cache
) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    cookie: {
      name: 'io',
      maxAge: SOCKETIO_COOKIE_MAX_AGE,
    },
  });

  const redisPubClient = createClient({
    url: SOCKETIO_REDIS_HOST,
    password: SOCKETIO_REDIS_PASSWORD,
    name: `${APP_NAME}-websockets`,
    pingInterval: 4 * 1000 * 60,
  });
  redisPubClient.on('error', (err: Error) => {
    console.error(`Error occured with websockets redis pub client : ${err}`);
  });
  redisPubClient.on('connect', () => {
    console.info('Websockets redis pub client connected.');
  });
  redisPubClient.on('reconnecting', () => {
    console.info('Websockets redis pub client reconnecting ...');
  });
  redisPubClient.on('ready', () => {
    console.info('Websockets redis pub client is ready.');
  });
  const redisSubClient = redisPubClient.duplicate();
  redisSubClient.on('error', (err: Error) => {
    console.error(`Error occured with websockets redis sub client : ${err}`);
  });

  Promise.all([redisPubClient.connect(), redisSubClient.connect()]).then(() => {
    io.adapter(createAdapter(redisPubClient, redisSubClient) as any);
  });

  const workspaces = io.of(WORKSPACE_PATH);
  workspaces.on('connection', async (socket) => {
    const [, workspaceId] = socket.nsp.name.match(WORKSPACE_PATH) || [];
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

    let subscription: Subscriber;
    const ready = events
      .subscribe(workspaceId, {
        id: userId as string,
        sessionId: sessionId as string,
        apiKey: apiKey as string,
        authData,
        socketId,
        callback: (event: PrismeEvent<any>) => {
          socket.emit(event.type, event);
        },
        searchOptions: cleanSearchQuery(query),
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
    cache
      .registerSocketId(workspaceId, sessionId as string, socketId)
      .catch(logger.error);

    // Handle events creation
    const userIp = Array.isArray(socket.handshake.headers?.['x-forwarded-for'])
      ? socket.handshake.headers?.['x-forwarded-for'][0]
      : socket.handshake.headers?.['x-forwarded-for'] ||
        socket.handshake.address;
    let childBroker = events.broker.child({
      workspaceId,
      userId: userId as string,
      sessionId: sessionId as string,
      socketId,
      ip: userIp,
    });
    socket.onAny(
      async (type, payload: Prismeai.PrismeEvent | SearchOptions) => {
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
            subscription.searchOptions = payload as SearchOptions;
          } else if (
            type === 'reconnection' &&
            (<any>payload)?.socketId &&
            sessionId
          ) {
            // Allow keeping same socketIds accross reconnection
            // in order to make runtime socket context persistent through reconnections
            const allowed = await cache.isKnownSocketId(
              workspaceId,
              sessionId as string,
              (<any>payload).socketId
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

            const previousSocketId = subscription.socketId;
            subscription.socketId = (<any>payload).socketId;
            logsCtx.socketId = (<any>payload).socketId;
            childBroker = events.broker.child({
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
          socket.emit('error', err);
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
