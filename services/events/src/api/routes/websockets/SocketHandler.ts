import { Broker } from '@prisme.ai/broker';
import { LocalSubscriber } from '../../../services/events/subscriptions';
import { SocketCtx } from './types';
import { Logger, logger } from '../../../logger';
import { Socket } from 'socket.io';
import { SearchOptions } from '../../../services/events/store';

export type SocketMetrics = {
  connectedAt: number;
  authenticatedAt: number;
};

export class SocketHandler implements SocketCtx {
  public socket: Socket;

  public workspaceId: string;
  public userId: string;
  public sessionId: string;
  public socketId: string;
  public reuseSocketId?: string;
  public userIp: string;
  public filters: SearchOptions;
  public apiKey?: string;
  public authData?: Record<string, any>;

  public subscriber?: LocalSubscriber;
  public broker: Broker;
  public logger: Logger;

  public disconnected: boolean;

  public metrics: SocketMetrics;

  constructor(socket: Socket, ctx: SocketCtx, broker: Broker) {
    this.socket = socket;

    this.workspaceId = ctx.workspaceId;
    this.userId = ctx.userId;
    this.sessionId = ctx.sessionId;
    this.socketId = ctx.socketId;
    if (ctx.reuseSocketId) {
      this.reuseSocketId = ctx.reuseSocketId;
    }
    this.userIp = ctx.userIp;
    this.filters = ctx.filters;
    this.apiKey = ctx.apiKey;
    this.authData = ctx.authData;
    this.logger = logger;
    this.broker = broker;

    this.disconnected = false;
    this.metrics = {
      connectedAt: Date.now(),
      authenticatedAt: 0,
    };

    this.update(ctx);
    this.attachSocketListeners(socket);
  }

  private attachSocketListeners(socket: Socket) {
    socket.on('disconnect', (reason) => {
      this.logger.info({
        msg: `Websocket disconnected (${reason})`,
      });
      this.disconnected = true;
      if (this.subscriber) {
        this.subscriber.unsubscribe();
      }
    });
    socket.on('connect', async () => {
      this.logger.info({
        msg: 'Websocket connected.',
      });
      socket.join(this.socketId);
    });
    socket.on('reconnect', () => {
      this.logger.info({
        msg: 'Websocket reconnected !',
      });
    });
    socket.on('reconnect_attempt', (attempt) => {
      this.logger.info({
        msg: `Websocket reconnection attempt ${attempt}`,
      });
    });
    socket.on('reconnect_failed', (attempt) => {
      this.logger.warn({
        msg: `Websocket could not reconnect`,
      });
    });
  }

  setSubscriber(subscriber: LocalSubscriber) {
    this.subscriber = subscriber;
    this.metrics.authenticatedAt = Date.now();
  }

  update(ctx: Partial<SocketCtx>) {
    if (ctx.socketId && ctx.socketId !== this.socketId) {
      if (this.socketId) {
        this.socket.leave(this.socketId);
      }
      this.socket.join(ctx.socketId);
    }

    Object.assign(this, ctx);

    this.broker = this.broker.child({
      workspaceId: ctx.workspaceId || this.workspaceId,
      userId: ctx.userId || (this.userId as string),
      sessionId: ctx.sessionId || (this.sessionId as string),
      socketId: ctx.socketId || this.socketId,
      ip: ctx.userIp || this.userIp,
    });

    this.logger = this.logger.child({
      workspaceId: ctx.workspaceId || this.workspaceId,
      userId: ctx.userId || (this.userId as string),
      sessionId: ctx.sessionId || (this.sessionId as string),
      socketId: ctx.socketId || this.socketId,
    });
  }
}
