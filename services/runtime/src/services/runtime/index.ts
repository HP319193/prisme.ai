import { Broker, PrismeEvent } from '@prisme.ai/broker';
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
  ContextUpdateOpLog,
  PrismeaiSession,
} from './contexts';
import { ObjectNotFoundError } from '../../errors';
import { EventType } from '../../eda';
import { executeAutomation } from './automations';
import {
  RUNTIME_EMITS_BROKER_TOPIC,
  ADDITIONAL_GLOBAL_VARS,
  API_URL,
  SYNCHRONIZE_CONTEXTS,
  STUDIO_URL,
  PAGES_HOST,
} from '../../../config';
import { jsonPathMatches, redact, ReadableStream } from '../../utils';
import { PrismeContext } from '../../api/middlewares';
import { AccessManager, SubjectType } from '../../permissions';

interface PendingWait {
  event: string;
  filters?: Record<string, any>;
  cancelTriggers?: boolean;
  request: {
    id: string;
    correlationId: string;
    expiresAt: number;
    alreadyFulfilled: boolean;
  };
}

export type WehookChunkOutput = {
  chunk?: object;
  headers?: Record<string, string>;
  status?: number;
};

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
  $http?: ReadableStream<WehookChunkOutput>;
}

type EventName = string;
export default class Runtime {
  private broker: Broker;
  private workspaces: Workspaces;
  private cache: Cache;

  private pendingWaits: Record<EventName, PendingWait[]>;
  private contexts: Record<string, ContextsManager[]>;

  private accessManager: AccessManager;

  constructor(
    broker: Broker,
    workspaces: Workspaces,
    cache: Cache,
    accessManager: AccessManager
  ) {
    this.broker = broker;
    this.workspaces = workspaces;
    this.cache = cache;
    this.pendingWaits = {};
    this.contexts = {};
    this.accessManager = accessManager;
  }

  async start() {
    // Redact emitted native events
    this.broker.beforeSendEventCallback = (event) => {
      const contexts = this.getContexts(event.source);
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
    this.startSessionsSynchronization();

    this.startContextsSynchronization();

    this.startEventsProcessing();

    this.startAccessManagerCacheSynchronization();
  }

  async testAutomation(
    automationSlug: string,
    body: Record<string, any>,
    ctx: PrismeContext,
    logger: Logger,
    broker: Broker
  ) {
    const { workspaceId, correlationId } = ctx;
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

    broker.send<Prismeai.TriggeredInteraction['payload']>(
      EventType.TriggeredInteraction,
      {
        workspaceId,
        automation: automationSlug,
        trigger: {
          type: 'automation',
          value: automationSlug,
        },
        startedAt: new Date().toISOString(),
      }
    );

    const result = await this.processTriggers(
      workspace,
      [
        {
          automationSlug,
          type: 'automation',
          value: automationSlug,
          workspace,
        },
      ],
      body,
      ctx,
      logger,
      broker
    );
    return result;
  }

  private startEventsProcessing() {
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
        EventType.TriggeredInteraction,
        EventType.PagePermissionsShared,
        EventType.PagePermissionsDeleted,
        EventType.PublishedWorkspaceVersion,
        EventType.DeletedWorkspaceVersion,
        EventType.PulledWorkspaceVersion,
        EventType.DuplicatedWorkspace,
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

    // Listen to pending & fulfilled waits
    this.broker.on<Prismeai.PendingWait['payload']>(
      [EventType.PendingWait, EventType.FulfilledWait],
      (event) => {
        if (event?.source?.serviceTopic === EventType.PendingWait) {
          this.registerPendingWait(event);
        } else if (event?.source?.serviceTopic === EventType.FulfilledWait) {
          const fulfilled = (event as any as Prismeai.FulfilledWait).payload;
          const contexts = this.getContexts(event.source);
          contexts.map((cur) => cur.notify(fulfilled.id, fulfilled.event));
        }
        return true;
      },
      {
        GroupPartitions: false,
      }
    );
  }

  private async startContextsSynchronization() {
    this.broker.on<Prismeai.UpdatedContexts['payload']>(
      EventType.UpdatedContexts,
      (event) => {
        const updates = event.payload?.updates.filter((cur) =>
          SYNCHRONIZE_CONTEXTS.includes(cur.context)
        );
        const contexts = this.getContexts(event.source);
        if (updates?.length && contexts?.length) {
          contexts.forEach((cur) => {
            cur.applyUpdateOpLogs(
              updates as ContextUpdateOpLog[],
              event.payload?.updateId!,
              event.source
            );
          });
        }
        return true;
      },
      {
        GroupPartitions: false,
      }
    );
  }

  private async startSessionsSynchronization() {
    this.broker.on<Prismeai.SucceededLogin['payload']>(
      [EventType.SuccededLogin],
      async (event) => {
        const {
          id: sessionId,
          expiresIn = 30 * 24 * 60 * 60,
          expires,
        } = event?.payload?.session || {};
        const userId = event?.payload?.id;
        if (!userId || !sessionId) {
          return true;
        }
        await this.cache.setSession({
          userId,
          sessionId,
          expiresIn,
          expires,
          authData: event?.payload?.authData,
          email: event?.payload?.email,
        });
        return true;
      }
    );
  }

  private registerPendingWait(
    event: PrismeEvent<Prismeai.PendingWait['payload']>
  ) {
    const payload = event.payload!;
    const request = {
      id: payload.id,
      correlationId: event.source?.correlationId!,
      expiresAt: payload.expiresAt,
      alreadyFulfilled: false,
    };

    payload.wait.oneOf.forEach((cur) => {
      const pendingWaitId = `${event?.source?.workspaceId}-${cur?.event}`;
      if (!this.pendingWaits[pendingWaitId]) {
        this.pendingWaits[pendingWaitId] = [];
      }
      this.pendingWaits[pendingWaitId].push({
        event: cur.event,
        filters: cur.filters,
        cancelTriggers: cur.cancelTriggers,
        request,
      });
    });
  }

  private fulfillPendingWaits(event: Prismeai.PrismeEvent, broker: Broker) {
    const pendingWaitId = `${event?.source?.workspaceId}-${event.type}`;
    const pendingWaits = this.pendingWaits[pendingWaitId];
    if (!pendingWaits?.length) {
      return;
    }
    const matchingWaits: PendingWait[] = [];
    this.pendingWaits[pendingWaitId] = pendingWaits.filter((cur) => {
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
      broker.send<Prismeai.FulfilledWait['payload']>(
        EventType.FulfilledWait,
        {
          id: cur.request.id,
          event,
        },
        {
          correlationId: cur.request.correlationId,
        }
      );

      if (cur.cancelTriggers) {
        cancelTriggers = true;
      }
    });

    return cancelTriggers;
  }

  async createContext(
    source: PrismeContext,
    session: Omit<PrismeaiSession, 'socketId'>
  ): Promise<ContextsManager> {
    const ctx = new ContextsManager(
      source,
      session,
      this.cache,
      this.broker,
      this.accessManager
    );
    ctx.additionalGlobals = {
      ...ADDITIONAL_GLOBAL_VARS,
      apiUrl: API_URL,
      studioUrl: STUDIO_URL,
      pagesHost: PAGES_HOST,
      workspacesRegistry: this.workspaces.workspacesRegistry,
    };
    await ctx.fetch();

    if (!(source.correlationId in this.contexts)) {
      this.contexts[source.correlationId] = [];
    }
    this.contexts[source.correlationId].push(ctx);
    return ctx;
  }

  removeContext(ctx: ContextsManager) {
    this.contexts[ctx.correlationId] = this.contexts[ctx.correlationId].filter(
      (cur) => cur != ctx
    );
    if (!this.contexts[ctx.correlationId]?.length) {
      delete this.contexts[ctx.correlationId];
    }
  }

  getContexts(source: PrismeEvent['source']) {
    return source?.correlationId
      ? this.contexts[source.correlationId] || []
      : [];
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
    let workspace: Workspace;
    try {
      workspace = await this.workspaces.getWorkspace(workspaceId);
    } catch (err) {
      logger.info({
        msg: `Skipping event ${event.id} since workspace ${workspaceId} cannot be loaded`,
        err,
      });
      return;
    }

    logger.debug({ msg: 'Starting to process event', event });
    const { triggers, payload } = await this.parseEvent(workspace, event);
    if (!triggers?.length) {
      logger.debug('Did not find any matching trigger for event ' + event.type);
      return;
    }

    // Only count new interaction for user emitted events & other native events !
    // Do not re emit EventType.TriggeredInteraction to avoid infinite loop
    if (
      (event.source.serviceTopic === RUNTIME_EMITS_BROKER_TOPIC &&
        event.source.userId) ||
      (event.source.serviceTopic !== RUNTIME_EMITS_BROKER_TOPIC &&
        event.source.serviceTopic !== EventType.TriggeredInteraction)
    ) {
      broker.send<Prismeai.TriggeredInteraction['payload']>(
        EventType.TriggeredInteraction,
        {
          workspaceId,
          automation: triggers[0].automationSlug,
          trigger: {
            type: 'event',
            value: event.type,
            id: event.id,
          },
          startedAt: new Date().toISOString(),
        },
        {
          userId: event.source.userId,
          sessionId: event.source.sessionId,
          correlationId: event.source.correlationId,
        }
      );
    }

    return await this.processTriggers(
      workspace,
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
    const { automationSlug } = webhook;
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

    const triggers = workspace.getEndpointTriggers(automationSlug);
    if (!triggers?.length) {
      throw new ObjectNotFoundError(
        `Did not find any matching trigger for endpoint ${automationSlug}`,
        { workspaceId: workspaceId, endpoint: automationSlug }
      );
    }

    broker.send<Prismeai.TriggeredInteraction['payload']>(
      EventType.TriggeredInteraction,
      {
        workspaceId,
        automation: triggers[0].automationSlug,
        trigger: {
          type: 'endpoint',
          value: decodeURIComponent(automationSlug),
        },
        startedAt: new Date().toISOString(),
      }
    );

    const result = await this.processTriggers(
      workspace,
      triggers,
      webhook,
      ctx,
      logger,
      broker
    );
    return result;
  }

  private async processTriggers(
    workspace: Workspace,
    triggers: DetailedTrigger[],
    payload: any,
    source: PrismeContext,
    logger: Logger,
    broker: Broker
  ) {
    const session = (await this.cache.getSession(source.sessionId)) || {
      userId: source.userId!! || source.sessionId!!, // For unauthenticated sessions, keep sessionId as a fake userId
      sessionId: source.sessionId!!,
      authData: {},
    };
    const ctx = await this.createContext(source, session);
    ctx.additionalGlobals = {
      ...ctx.additionalGlobals,
      workspaceName: workspace.dsul.name,
    };
    let result;
    try {
      result = await Promise.all(
        triggers.map((trigger: DetailedTrigger) => {
          return this.processTrigger(trigger, payload, ctx, logger, broker);
        })
      );
    } finally {
      this.removeContext(ctx);
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

      const childCtx = await ctx.childAutomation(
        automation,
        payload,
        childBroker,
        {
          type: trigger.type,
          value: trigger.value,
          id: trigger.type === 'event' ? payload.id : undefined,
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
      const { oldConfig, ...appInstance } = payload?.appInstance!;
      await workspace.updateImport(payload!.slug!, appInstance!);
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

    // On duplicated workspace, simuluate apps installed events
    if (event.type === EventType.DuplicatedWorkspace) {
      triggers.push(
        ...Object.entries(workspace.dsul.imports || {}).flatMap(
          ([slug, appInstance]) =>
            workspace.getEventTriggers({
              ...event,
              source: {
                ...event.source,
                appInstanceFullSlug: slug,
              },
              type: EventType.InstalledApp,
              payload: {
                appInstance,
                slug,
              },
            })
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

  private async startAccessManagerCacheSynchronization() {
    const workspaces: Record<string, Prismeai.Workspace> = {};
    const uncachedFetch = (<any>this.accessManager).fetch.bind(
      this.accessManager
    );
    // Patch accessManager.fetch to cache workspaces
    (<any>this.accessManager).fetch = (
      subjectType: SubjectType,
      id: string
    ) => {
      if (
        subjectType === SubjectType.Workspace &&
        typeof id === 'string' &&
        workspaces[id]
      ) {
        return workspaces[id];
      }
      const ret = uncachedFetch(subjectType, id);
      if (subjectType === SubjectType.Workspace && typeof id === 'string') {
        workspaces[id] = ret;
      }
      return ret;
    };

    // Update our workspaces cache
    this.broker.on<Prismeai.WorkspacePermissionsShared['payload']>(
      [
        EventType.WorkspacePermissionsShared,
        EventType.WorkspacePermissionsDeleted,
      ],
      (event) => {
        const { workspaceId } = event.source;
        if (workspaceId && workspaceId in workspaces) {
          delete workspaces[workspaceId];
        }
        return true;
      },
      {
        GroupPartitions: false,
      }
    );
  }
}
