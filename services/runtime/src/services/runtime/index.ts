import { Broker, PrismeEvent } from '@prisme.ai/broker';
//@ts-ignore
import LRU from 'lru-cache';
import { Logger } from '../../logger';
import {
  DetailedAutomation,
  DetailedTrigger,
  Workspace,
  Workspaces,
} from '../workspaces';
import { Cache } from '../../cache';
import {
  ContextsManager,
  ContextType,
  ContextUpdateOpLog,
  PrismeaiSession,
} from './contexts';
import { ObjectNotFoundError } from '../../errors';
import { EventType } from '../../eda';
import { executeAutomation } from './automations';
import {
  RUNTIME_EMITS_BROKER_TOPIC,
  ADDITIONAL_GLOBAL_VARS,
  PUBLIC_API_URL,
} from '../../../config';
import { jsonPathMatches, redact } from '../../utils';
import { PrismeContext } from '../../api/middlewares';

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

export interface Webhook {
  workspaceId: string;
  automationSlug: string;
  /**
   * example:
   * post
   */
  method: string;
  headers: {
    [key: string]: any;
  };
  query: {
    [key: string]: any;
  };
  body: {
    [key: string]: any;
  };
}

type EventName = string;
export default class Runtime {
  private broker: Broker;
  private workspaces: Workspaces;
  private cache: Cache;
  private sessionsLRU: LRU<string, PrismeaiSession>;

  private pendingWaits: Record<EventName, PendingWait[]>;
  private contexts: Record<string, ContextsManager[]>;

  constructor(broker: Broker, workspaces: Workspaces, cache: Cache) {
    this.broker = broker;
    this.workspaces = workspaces;
    this.cache = cache;
    this.pendingWaits = {};
    this.contexts = {};
    this.sessionsLRU = new LRU({
      max: 2000,
    });
  }

  async registerSession(session: PrismeaiSession) {
    this.sessionsLRU.set(session.sessionId, session);
    await this.cache.setSession(session);
  }

  async getSession(sessionId: string) {
    const session =
      this.sessionsLRU.get(sessionId) ||
      ((await this.cache.getSession(sessionId)) as PrismeaiSession);
    if (session && session.expires) {
      const expiresIn =
        (new Date(session.expires).getTime() - Date.now()) / 1000;
      if (expiresIn > 0) {
        session.expiresIn = Math.round(expiresIn);
      }
    }
    return session;
  }

  async start() {
    // Redact emitted native events
    this.broker.beforeSendEventCallback = (event) => {
      const contexts =
        event?.source?.correlationId &&
        this.contexts[event?.source?.correlationId];
      if (
        event.payload &&
        event.source.serviceTopic !== RUNTIME_EMITS_BROKER_TOPIC &&
        contexts &&
        contexts.length
      ) {
        event.payload = contexts.reduce(
          (payload, ctx) => redact(payload, ctx.secrets),
          event.payload
        );
      }
    };

    // Pull session tokens to inhect them within their corresponding context
    this.broker.on<Prismeai.SucceededLogin['payload']>(
      [EventType.SuccededLogin],
      async (event) => {
        const {
          token,
          id: sessionId,
          expiresIn = 30 * 24 * 60 * 60,
          expires,
        } = event?.payload?.session || {};
        const userId = event?.payload?.id;
        if (!token || !userId || !sessionId) {
          return true;
        }
        await this.registerSession({
          userId,
          sessionId,
          token,
          expiresIn,
          expires,
          authData: event?.payload?.authData,
          email: event?.payload?.email,
        });
        return true;
      }
    );

    // Sync contexts
    this.broker.on<Prismeai.UpdatedContexts['payload']>(
      EventType.UpdatedContexts,
      (event) => {
        const updates = event.payload?.updates.filter(
          (cur) => cur.context === ContextType.Run
        );
        const contexts = this.contexts[event.source.correlationId!];
        if (updates?.length && contexts.length) {
          contexts.forEach((cur) => {
            cur.applyUpdateOpLogs(updates as ContextUpdateOpLog[], event.id);
          });
        }
        return true;
      },
      {
        GroupPartitions: false,
      }
    );

    // Start processing events
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
        EventType.ExecutedAutomation,
        EventType.FailedFetch,
        EventType.TriggeredWebhook,
      ],
      async (event, broker, { logger }) => {
        if (!event.source.workspaceId || !event.source.correlationId) {
          return true;
        }
        const cancelTriggers = this.fulfillPendingWaits(
          event as Prismeai.PrismeEvent,
          broker
        );
        // ExecutedAutomation listening is only allowed within waits, as it would cause an infinite loop in a regular trigger
        if (!cancelTriggers && event.type !== EventType.ExecutedAutomation) {
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
    session: PrismeaiSession,
    correlationId: string
  ): Promise<ContextsManager> {
    const ctx = new ContextsManager(
      workspaceId,
      session,
      correlationId,
      this.cache,
      this.broker
    );
    ctx.additionalGlobals = {
      ...ADDITIONAL_GLOBAL_VARS,
      apiUrl: PUBLIC_API_URL,
    };
    await ctx.fetch();

    if (!(correlationId in this.contexts)) {
      this.contexts[correlationId] = [];
    }
    this.contexts[correlationId].push(ctx);
    return ctx;
  }

  async processEvent(
    event: Prismeai.PrismeEvent,
    logger: Logger,
    broker: Broker
  ) {
    const { workspaceId, correlationId } = event.source;
    if (!correlationId || !workspaceId) {
      throw new Error(
        `Can't process event '${event.type}' without source correlationId or workspaceId !`
      );
    }
    const workspace = await this.workspaces.getWorkspace(workspaceId);

    logger.debug({ msg: 'Starting to process event', event });
    const { triggers, payload } = await this.parseEvent(workspace, event);
    if (!triggers?.length) {
      logger.trace('Did not find any matching trigger');
      return;
    }

    return await this.processTriggers(
      triggers,
      payload,
      event.source as PrismeContext,
      logger,
      broker
    );
  }

  public async triggerWebhook(
    webhook: Webhook,
    ctx: PrismeContext,
    logger: Logger,
    broker: Broker
  ) {
    const { workspaceId, correlationId } = ctx;
    const { automationSlug, method } = webhook;
    if (!correlationId || !workspaceId) {
      throw new Error(
        `Can't process webhook '${automationSlug}' without source correlationId or workspaceId !`
      );
    }
    const workspace = await this.workspaces.getWorkspace(workspaceId);

    logger.info({
      msg: 'Starting to process webhook ' + automationSlug,
      endpoint: automationSlug,
    });

    broker.send<Prismeai.TriggeredWebhook['payload']>(
      EventType.TriggeredWebhook,
      {
        workspaceId,
        automationSlug: decodeURIComponent(automationSlug),
        method,
      }
    );

    const triggers = workspace.getEndpointTriggers(automationSlug);
    if (!triggers?.length) {
      throw new ObjectNotFoundError(
        `Did not find any matching trigger for endpoint ${automationSlug}`,
        { workspaceId: workspaceId, endpoint: automationSlug }
      );
    }

    return await this.processTriggers(triggers, webhook, ctx, logger, broker);
  }

  private async processTriggers(
    triggers: DetailedTrigger[],
    payload: any,
    source: PrismeContext,
    logger: Logger,
    broker: Broker
  ) {
    const session = (await this.getSession(source.sessionId)) || {
      userId: source.userId!!,
      sessionId: source.sessionId!!,
    };
    const ctx = await this.getContexts(
      source.workspaceId!!,
      session,
      source.correlationId!!
    );

    let result;
    try {
      result = await Promise.all(
        triggers.map(async (trigger: DetailedTrigger) => {
          return this.processTrigger(trigger, payload, ctx, logger, broker);
        })
      );
    } finally {
      this.contexts[source.correlationId] = this.contexts[
        source.correlationId
      ].filter((cur) => cur != ctx);
      if (!this.contexts[source.correlationId]?.length) {
        delete this.contexts[source.correlationId];
      }
    }
    return result;
  }

  private async processTrigger(
    trigger: DetailedTrigger,
    payload: any,
    ctx: ContextsManager,
    logger: Logger,
    broker: Broker
  ) {
    const automation = trigger.workspace.getAutomation(trigger.automationSlug);
    if (!automation) {
      logger.trace(
        `Did not find any matching automation '${trigger.automationSlug}' for ${trigger.type} trigger '${trigger.value})`
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
          // Even if coming from emit topic, do not send in emit topic by default, as native events must all be redacted
          forceTopic: undefined,
        }
      );

      const childCtx = ctx.childAutomation(automation, payload, broker, {
        type: trigger.type,
        value: trigger.value,
        id: trigger.type === 'event' ? payload.id : undefined,
      });

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
    return executeAutomation(
      workspace,
      automation,
      ctx,
      logger,
      broker,
      this.cache,
      true
    );
  }

  private async parseEvent(
    workspace: Workspace,
    event: Prismeai.PrismeEvent
  ): Promise<{
    triggers: DetailedTrigger[];
    payload: any;
  }> {
    // In case our in-memory workspace has not been updated yet, force its config update
    // In the future, we might have a callback ordered queue natively handled by prisme.ai/broker
    if (event.type === EventType.ConfiguredWorkspace) {
      workspace.config =
        (<PrismeEvent<Prismeai.ConfiguredWorkspace['payload']>>event).payload
          ?.config?.value || {};
    }

    if (
      event.type === EventType.ConfiguredApp ||
      event.type === EventType.InstalledApp
    ) {
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
      event.type === EventType.DeletedApp ||
      event.type === EventType.DeletedWorkspace
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
        id: event.id,
        source: event.source,
        payload: event.payload,
      },
    };
  }
}
