import { Broker } from '@prisme.ai/broker';
import { LocalSubscriber } from '../../../services/events/subscriptions';
import { SocketCtx } from './types';
import { Logger, logger } from '../../../logger';

export class SocketHandler implements SocketCtx {
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

  constructor(ctx: SocketCtx, broker: Broker) {
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

    this.update(ctx);
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
