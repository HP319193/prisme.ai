import { Broker } from '@prisme.ai/broker';
import { LocalSubscriber } from '../../../services/events/subscriptions';
import { SocketCtx } from './types';
import { Logger, logger } from '../../../logger';
import { Socket } from 'socket.io';

export class SocketHandler implements SocketCtx {
  public socket: Socket;

  public workspaceId: string;
  public userId: string;
  public sessionId: string;
  public socketId: string;
  public userIp: string;
  public query: Record<string, any>;
  public apiKey?: string;
  public authData?: Record<string, any>;

  public subscriber?: LocalSubscriber;
  public broker: Broker;
  public logger: Logger;

  public disconnected: boolean;

  constructor(socket: Socket, ctx: SocketCtx, broker: Broker) {
    this.socket = socket;

    this.workspaceId = ctx.workspaceId;
    this.userId = ctx.userId;
    this.sessionId = ctx.sessionId;
    this.socketId = ctx.socketId;
    this.userIp = ctx.userIp;
    this.query = ctx.query;
    this.apiKey = ctx.apiKey;
    this.authData = ctx.authData;
    this.logger = logger;
    this.broker = broker;

    this.disconnected = false;

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

  update(ctx: Partial<SocketCtx>) {
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
