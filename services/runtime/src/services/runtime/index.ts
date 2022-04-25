import { Broker, PrismeEvent } from '@prisme.ai/broker';
import { Logger } from '../../logger';
import {
  DetailedAutomation,
  DetailedTrigger,
  Workspace,
  Workspaces,
} from '../workspaces';
import { CacheDriver } from '../../cache';
import { ContextsManager } from './contexts';
import { ObjectNotFoundError } from '../../errors';
import { EventType } from '../../eda';
import { executeAutomation } from './automations';
import { RUNTIME_EMITS_BROKER_TOPIC } from '../../../config';
import { jsonPathMatches } from '../../utils';

interface PendingWait {
  event: string;
  filters?: Record<string, any>;
  cancelTriggers?: boolean;
  request: {
    id: string;
    expiresAt: number;
    alreadyFulfilled: boolean;
  };
}

type EventName = string;
export default class Runtime {
  private broker: Broker;
  private workspaces: Workspaces;
  private cache: CacheDriver;

  private pendingWaits: Record<EventName, PendingWait[]>;

  constructor(broker: Broker, workspaces: Workspaces, cache: CacheDriver) {
    this.broker = broker;
    this.workspaces = workspaces;
    this.cache = cache;
    this.pendingWaits = {};
  }

  async start() {
    this.broker.on(
      [
        RUNTIME_EMITS_BROKER_TOPIC,
        EventType.ConfiguredWorkspace,
        EventType.ConfiguredApp,
        EventType.InstalledApp,
        EventType.UninstalledApp,
        EventType.DeletedWorkspace,
        EventType.DeletedApp,
        EventType.PublishedApp,
      ],
      async (event, broker, { logger }) => {
        if (!event.source.workspaceId || !event.source.correlationId) {
          return true;
        }
        const cancelTriggers = this.fulfillPendingWaits(
          event as Prismeai.PrismeEvent,
          broker
        );
        if (!cancelTriggers) {
          await this.processEvent(
            event as Prismeai.PrismeEvent,
            logger,
            broker
          );
        }
        return true;
      }
    );

    // Listen to pending waits
    this.broker.on<Prismeai.PendingWait['payload']>(
      EventType.PendingWait,
      (event) => {
        this.registerPendingWait(event.payload!);
        return true;
      },
      {
        GroupPartitions: false,
      }
    );
  }

  private registerPendingWait(payload: Prismeai.PendingWait['payload']) {
    const request = {
      id: payload.id,
      expiresAt: payload.expiresAt,
      alreadyFulfilled: false,
    };

    payload.wait.oneOf.forEach((cur) => {
      if (!this.pendingWaits[cur.event]) {
        this.pendingWaits[cur.event] = [];
      }
      this.pendingWaits[cur.event].push({
        event: cur.event,
        filters: cur.filters,
        cancelTriggers: cur.cancelTriggers,
        request,
      });
    });
  }

  private fulfillPendingWaits(event: Prismeai.PrismeEvent, broker: Broker) {
    const pendingWaits = this.pendingWaits[event.type];
    if (!pendingWaits?.length) {
      return;
    }
    const matchingWaits: PendingWait[] = [];
    this.pendingWaits[event.type] = pendingWaits.filter((cur) => {
      if (cur.request.expiresAt < Date.now() || cur.request.alreadyFulfilled) {
        return false; // Clean outdated waits
      }
      if (!jsonPathMatches(cur.filters, event)) {
        return true; // This one is not matching
      }

      cur.request.alreadyFulfilled = true;
      // This one is matching : clean it & fulfill it
      matchingWaits.push(cur);
      return false;
    });

    let cancelTriggers = false;
    matchingWaits.map((cur) => {
      const FulfilledWaitEvent = EventType.FulfilledWait.replace(
        '{{id}}',
        cur.request.id
      );
      broker.send<Prismeai.FulfilledWait['payload']>(FulfilledWaitEvent, {
        id: cur.request.id,
        event,
      });

      if (cur.cancelTriggers) {
        cancelTriggers = true;
      }
    });

    return cancelTriggers;
  }

  async getContexts(
    workspaceId: string,
    userId: string,
    correlationId: string,
    payload: any
  ): Promise<ContextsManager> {
    const ctx = new ContextsManager(
      workspaceId,
      userId,
      correlationId,
      this.cache,
      payload,
      this.broker
    );
    await ctx.fetch();
    return ctx;
  }

  async processEvent(
    event: Prismeai.PrismeEvent,
    logger: Logger,
    broker: Broker
  ) {
    const { userId, workspaceId, correlationId } = event.source;
    if (!correlationId || !workspaceId) {
      throw new Error(
        `Can't process event '${event.type}' without source correlationId or workspaceId !`
      );
    }
    const workspace = await this.workspaces.getWorkspace(workspaceId);

    logger.debug({ msg: 'Starting to process event', event });
    const { triggers, payload } = await this.parseEvent(workspace, event);
    const ctx = await this.getContexts(
      workspaceId!!,
      userId!!,
      correlationId!!,
      payload
    );

    if (!triggers?.length) {
      logger.trace('Did not find any matching trigger');
      return;
    }

    return await Promise.all(
      triggers.map(async (trigger: DetailedTrigger) => {
        return this.processTrigger(trigger, ctx, logger, broker);
      })
    );
  }

  private async processTrigger(
    trigger: DetailedTrigger,
    ctx: ContextsManager,
    logger: Logger,
    broker: Broker
  ) {
    const automation = trigger.workspace.getAutomation(trigger.automationSlug);
    if (!automation) {
      logger.trace(
        `Did not find any matching automation '${trigger.automationSlug}' for trigger '${trigger.endpoint})`
      );
      throw new ObjectNotFoundError(`Automation not found`, {
        workspaceId: trigger.workspace.id,
        automation: trigger.automationSlug,
        ...trigger.workspace.appContext,
      });
    }
    try {
      const childBroker = broker.child(
        {
          appSlug: automation.workspace.appContext?.appSlug,
          appInstanceFullSlug:
            automation.workspace.appContext?.appInstanceFullSlug,
          automationSlug: automation.slug,
          appInstanceDepth:
            automation.workspace.appContext?.parentAppSlugs?.length || 0,
        },
        {
          validateEvents: false,
          forceTopic: RUNTIME_EMITS_BROKER_TOPIC,
        }
      );

      const childCtx = ctx.child(
        {
          config: automation.workspace.config,
        },
        {
          resetLocal: false,
          appContext: automation.workspace?.appContext,
          broker: childBroker,
          automationSlug: automation.slug!,
        }
      );

      const output = await this.executeAutomation(
        trigger.workspace,
        automation,
        childCtx,
        logger,
        childBroker
      );

      return {
        output,
        slug: trigger.automationSlug,
        ...trigger.workspace.appContext,
      };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  private async executeAutomation(
    workspace: Workspace,
    automation: DetailedAutomation,
    ctx: ContextsManager,
    logger: Logger,
    broker: Broker
  ) {
    return executeAutomation(workspace, automation, ctx, logger, broker, true);
  }

  private async parseEvent(
    workspace: Workspace,
    event: Prismeai.PrismeEvent
  ): Promise<{
    triggers: DetailedTrigger[];
    payload: any;
  }> {
    if (event.type === EventType.TriggeredWebhook) {
      const { automationSlug, body, headers, query, method } = (<
        Prismeai.TriggeredWebhook
      >event).payload;
      const parsed = {
        triggers: workspace.getEndpointTriggers(automationSlug),
        payload: {
          body,
          headers,
          query,
          method,
        },
      };
      if (!parsed.triggers?.length) {
        throw new ObjectNotFoundError(
          `Did not find any matching trigger for endpoint ${automationSlug}`,
          { workspaceId: workspace.id, endpoint: automationSlug }
        );
      }

      return parsed;
    }

    // In case our in-memory workspace has not been updated yet, force its config update
    // In the future, we might have a callback ordered queue natively handled by prisme.ai/broker
    if (event.type === EventType.ConfiguredWorkspace) {
      workspace.config =
        (<PrismeEvent<Prismeai.ConfiguredWorkspace['payload']>>event).payload
          ?.config?.value || {};
    }

    if (event.type === EventType.ConfiguredApp) {
      const payload = (<PrismeEvent<Prismeai.ConfiguredAppInstance['payload']>>(
        event
      ))?.payload;
      await workspace.updateImport(payload!.slug!, payload!.appInstance!);
    }

    const triggers = workspace.getEventTriggers(event);
    // Simulate workspace.app.uninstalled events when workspace is deleted
    if (event.type === EventType.DeletedWorkspace) {
      triggers.push(
        ...Object.entries(workspace.dsul.imports || {}).flatMap(
          ([slug, appInstance]) =>
            workspace.getEventTriggers({
              ...event,
              source: {
                ...event.source,
                appInstanceFullSlug: slug,
              },
              type: EventType.UninstalledApp,
              payload: {
                appInstance,
                slug,
              },
            })
        )
      );
    }

    // Dispatch apps.published event to installed apps (as their instance config will be packaged as a new app)
    if (
      event.type === EventType.PublishedApp ||
      event.type === EventType.DeletedApp
    ) {
      triggers.push(
        ...Object.values(workspace.imports || {}).flatMap((workspace) =>
          workspace.getEventTriggers(event)
        )
      );
    }

    return {
      triggers,
      payload: {
        source: event.source,
        payload: event.payload,
      },
    };
  }
}
