import { Broker, PrismeEvent } from "@prisme.ai/broker";
import { Logger } from "../../logger";
import { DetailedTrigger, Workspace, Workspaces } from "../workspaces";
import { CacheDriver } from "../../cache";
import { ContextsManager } from "./contexts";
import { ObjectNotFoundError, PrismeError } from "../../errors";
import { EventType } from "../../eda";
import { executeAutomation } from "./automations";

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
    this.broker.all(async (event, broker, { logger }) => {
      if (
        !event.source.workspaceId ||
        !event.source.userId ||
        !event.source.correlationId
      ) {
        return true;
      }
      if (event.type === EventType.TriggeredWebhook) {
        // This event is directly handed from routes/webhooks.ts to allow passing back worklow result within http response
        return true;
      }
      if (event.type.startsWith("apps.")) {
        await this.processEvent(event, logger, broker);
      }
      return true;
    });
  }

  async getContexts(
    workspaceId: string,
    userId: string,
    correlationId: string
  ): Promise<ContextsManager> {
    const ctx = new ContextsManager(
      workspaceId,
      userId,
      correlationId,
      this.cache
    );
    await ctx.fetch();
    return ctx;
  }

  async processEvent(event: PrismeEvent, logger: Logger, broker: Broker) {
    const { userId, workspaceId, correlationId } = event.source;
    if (!userId || !correlationId || !workspaceId) {
      throw new Error(
        `Can't process event '${event.type}' without source userId, correlationId or workspaceId !`
      );
    }
    const ctx = await this.getContexts(
      workspaceId!!,
      userId!!,
      correlationId!!
    );

    logger.debug({ msg: "Starting to process event", event });
    const workspace = await this.workspaces.getWorkspace(
      ctx.global.workspaceId
    );

    try {
      const { triggers, payload } = this.parseEvent(workspace, event);
      if (!triggers?.length) {
        logger.trace("Did not find any matching trigger");
        return;
      }
      return await Promise.all(
        triggers.map(async (cur: DetailedTrigger) => {
          const automation = workspace.getAutomation(cur.automationSlug);
          if (!automation) {
            logger.trace(
              `Did not find any matching automation '${cur.automationSlug}' for trigger '${cur.endpoint})`
            );
            throw new ObjectNotFoundError(`Automation not found`, {
              workspaceId,
              automation: cur.automationSlug,
            });
          }
          const output = await executeAutomation(
            workspace,
            automation,
            payload,
            ctx,
            logger,
            broker
          );
          return {
            output,
            slug: cur.automationSlug,
          };
        })
      );
    } catch (error) {
      if (error instanceof PrismeError) {
        throw error;
      } else {
        logger.error(error);
        throw new Error("Internal error");
      }
    }
  }

  private parseEvent(
    workspace: Workspace,
    event: PrismeEvent
  ): {
    triggers: DetailedTrigger[];
    payload: any;
  } {
    if (event.type === EventType.TriggeredWebhook) {
      const { automationSlug, payload } = (<Prismeai.TriggeredWebhook>event)
        .payload;

      const parsed = {
        triggers: workspace.getEndpointTriggers(automationSlug),
        payload,
      };
      if (!parsed.triggers?.length) {
        throw new ObjectNotFoundError(
          `Did not find any matching trigger for endpoint ${automationSlug}`,
          { workspaceId: workspace.id, endpoint: automationSlug }
        );
      }

      return parsed;
    }

    return {
      triggers: workspace.getEventTriggers(event.type),
      payload: event.payload,
    };
  }
}
