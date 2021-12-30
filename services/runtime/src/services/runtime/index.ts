import { Broker, PrismeEvent } from "@prisme.ai/broker";
import { Logger } from "../../logger";
import { EventType } from "../../eda";
import { Workspaces } from "../workspaces";
import processEvent from "./processEvent";
import { CacheDriver } from "../../cache";
import { ContextsManager } from "./contexts";

export default class Runtime {
  private broker: Broker;
  private workspaces: Workspaces;
  private cache: CacheDriver;

  constructor(broker: Broker, workspaces: Workspaces, cache: CacheDriver) {
    this.broker = broker;
    this.workspaces = workspaces;
    this.cache = cache;
  }

  async start() {
    this.broker.on<Prismeai.TriggeredWebhook["payload"]>(
      EventType.TriggeredWebhook,
      async (event, broker, { logger }) => {
        logger.debug({ msg: "Webhook triggered", event });
        return await this.processEvent(
          event,
          await this.getContexts(event),
          logger,
          broker
        );
      }
    );

    // TODO replace with the "listening all" method
    this.broker.on<any>(
      "apps.someApp.someEvent",
      async (event, broker, { logger }) => {
        if (!event.source.workspaceId) {
          return true;
        }
        return await this.processEvent(
          event,
          await this.getContexts(event),
          logger,
          broker
        );
      }
    );
  }

  async getContexts(event: PrismeEvent): Promise<ContextsManager> {
    const { userId, workspaceId, correlationId } = event.source;
    if (!userId || !correlationId || !workspaceId) {
      throw new Error(
        `Can't process event '${event.type}' without source userId, correlationId or workspaceId !`
      );
    }

    const ctx = new ContextsManager(
      workspaceId,
      userId,
      correlationId,
      this.cache
    );
    await ctx.fetch();
    return ctx;
  }

  async processEvent(
    event: PrismeEvent,
    ctx: ContextsManager,
    logger: Logger,
    broker: Broker
  ) {
    logger.debug({ msg: "Starting to process event", event });
    const workspace = await this.workspaces.getWorkspace(
      ctx.global.workspaceId
    );
    await processEvent(workspace, event, ctx, logger, broker);
    return true;
  }
}
