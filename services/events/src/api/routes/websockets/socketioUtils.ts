import http from 'http';
import { Server, Socket } from 'socket.io';
import { createClient } from '@redis/client';
//@ts-ignore Dunno why, but typings not found in CI
import { createAdapter } from '@socket.io/redis-streams-adapter';
import { createAdapter as createPubSubAdapter } from '@socket.io/redis-adapter';
import {
  API_KEY_HEADER,
  APP_NAME,
  AUTH_DATA_HEADER,
  EVENTS_SOCKETIO_ADAPTER,
  SESSION_ID_HEADER,
  SOCKETIO_COOKIE_MAX_AGE,
  SOCKETIO_REDIS_HOST,
  SOCKETIO_REDIS_PASSWORD,
  USER_ID_HEADER,
} from '../../../../config';
import { SocketCtx, WORKSPACE_NSP_PATTERN } from './types';
import { logger } from '../../../logger';

export async function getSocketioServer(httpServer: http.Server) {
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
  await redisWebsocketClient.connect();

  let adapter: any;
  if (EVENTS_SOCKETIO_ADAPTER === 'redis') {
    const redisSubClient = redisWebsocketClient.duplicate();
    await redisSubClient.connect();
    adapter = createPubSubAdapter(redisWebsocketClient, redisSubClient) as any;
  } else if (EVENTS_SOCKETIO_ADAPTER === 'redis-streams') {
    adapter = createAdapter(redisWebsocketClient) as any;
  }

  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    cookie: {
      name: 'io',
      maxAge: SOCKETIO_COOKIE_MAX_AGE,
    },
    adapter,
  });

  return io;
}

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
    authData = JSON.parse(socket.handshake.headers[AUTH_DATA_HEADER] as string);
  } catch {
    logger.error({
      msg: `Could not parse JSON from authData header '${AUTH_DATA_HEADER}'`,
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
