import { PrismeEvent } from '@prisme.ai/broker';
import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from '@node-redis/client';
import {
  API_KEY_HEADER,
  SESSION_ID_HEADER,
  SOCKETIO_COOKIE_MAX_AGE,
  SOCKETIO_REDIS_HOST,
  SOCKETIO_REDIS_PASSWORD,
  USER_ID_HEADER,
} from '../../../config';
import { logger } from '../../logger';
import sendEvent from '../../services/events/send';
import { SearchOptions } from '../../services/events/store';
import { Subscriptions } from '../../services/events/Subscriptions';
import { cleanSearchQuery } from './events';

const WORKSPACE_PATH = /^\/v2\/workspaces\/([\w-_]+)\/events$/;

export function initWebsockets(httpServer: http.Server, events: Subscriptions) {
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
  });
  redisPubClient.on('error', (err: Error) => {
    console.error(`Error occured with websockets redis pub client : ${err}`);
  });
  const redisSubClient = redisPubClient.duplicate();
  redisPubClient.on('error', (err: Error) => {
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
    const userId = socket.handshake.headers[USER_ID_HEADER];
    if (!userId) {
      logger.error(
        'Cannot handle a websocket subscription to events without authenticated user id'
      );
      return;
    }
    const sessionId = socket.handshake.headers[SESSION_ID_HEADER];
    const apiKey = socket.handshake.headers[API_KEY_HEADER];
    const subscription = await events.subscribe(workspaceId, {
      id: userId as string,
      sessionId: sessionId as string,
      apiKey: apiKey as string,
      callback: (event: PrismeEvent<any>) => {
        socket.emit(event.type, event);
      },
      searchOptions: cleanSearchQuery(query),
    });

    // Handle events creation
    const childBroker = events.broker.child({
      workspaceId,
      userId: userId as string,
      sessionId: sessionId as string,
    });
    socket.onAny(
      async (type, payload: Prismeai.PrismeEvent | SearchOptions) => {
        try {
          if (type === 'event') {
            await sendEvent(
              workspaceId,
              payload as Prismeai.PrismeEvent,
              subscription.accessManager,
              childBroker
            );
          } else if (type === 'filters') {
            subscription.searchOptions = payload as SearchOptions;
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
    socket.on('disconnect', () => {
      subscription.unsubscribe();
    });
  });
}
