import { Broker, PendingEvents, PrismeEvent } from '@prisme.ai/broker';

import {
  APP_NAME,
  BROKER_DRIVER,
  BROKER_HOST,
  BROKER_PASSWORD,
  EVENTS_OAS_PATH,
  BROKER_WHITELIST_EVENT_PREFIXES,
  BROKER_NAMESPACE,
  BROKER_TOPIC_MAXLEN,
  BROKER_EMIT_MAXLEN,
  BROKER_MAX_SOCKETS,
} from '../../config';
import { Logger, logger } from '../logger';

export enum EventType {
  Error = 'error',
  SuccededLogin = 'gateway.login.succeeded',

  ExecutedAutomation = 'runtime.automations.executed',
  ScheduledAutomation = 'runtime.automations.scheduled',
  TriggeredInteraction = 'runtime.interactions.triggered',
  UpdatedContexts = 'runtime.contexts.updated',
  PendingWait = 'runtime.waits.pending',
  FulfilledWait = 'runtime.waits.fulfilled',
  FailedFetch = 'runtime.fetch.failed',

  CreatedWorkspace = 'workspaces.created',
  ConfiguredWorkspace = 'workspaces.configured',
  ImportedWorkspace = 'workspaces.imported',
  UpdatedRuntimeDSUL = 'runtime.dsul.updated',
  UpdatedWorkspace = 'workspaces.updated',
  DeletedWorkspace = 'workspaces.deleted',
  CreatedAutomation = 'workspaces.automations.created',
  UpdatedAutomation = 'workspaces.automations.updated',
  DeletedAutomation = 'workspaces.automations.deleted',
  PublishedWorkspaceVersion = 'workspaces.versions.published',
  DeletedWorkspaceVersion = 'workspaces.versions.deleted',

  InstalledApp = 'workspaces.apps.installed',
  UninstalledApp = 'workspaces.apps.uninstalled',
  ConfiguredApp = 'workspaces.apps.configured',

  DeletedApp = 'apps.deleted',
  PublishedApp = 'apps.published',

  CreatedUserTopic = 'events.userTopics.created',
  JoinedUserTopic = 'events.userTopics.joined',

  SuspendedWorkspace = 'workspaces.suspended',
  PagePermissionsShared = 'workspaces.pages.permissions.shared',
  PagePermissionsDeleted = 'workspaces.pages.permissions.deleted',

  DuplicatedWorkspace = 'workspaces.duplicated',
  UpdatedWorkspaceSecurity = 'workspaces.security.updated',
  UpdatedWorkspaceSecrets = 'workspaces.secrets.updated',
  WorkspacePermissionsShared = 'workspaces.permissions.shared',
  WorkspacePermissionsDeleted = 'workspaces.permissions.deleted',
}
export class CallbackContext {
  public logger: Logger;

  constructor(event: PrismeEvent) {
    this.logger = logger.child(event.source);
  }
}

export function initEDA(service = APP_NAME) {
  const broker = new Broker<CallbackContext>(
    {
      service,
    },
    {
      driver: {
        type: BROKER_DRIVER,
        host: BROKER_HOST,
        password: BROKER_PASSWORD,
        namespace: BROKER_NAMESPACE,
        topicsMaxLen: BROKER_TOPIC_MAXLEN,
        maxSockets: BROKER_MAX_SOCKETS,
      },
      validator: {
        oasFilepath: EVENTS_OAS_PATH,
        whitelistEventPrefixes: BROKER_WHITELIST_EVENT_PREFIXES.concat([
          'runtime.waits.fulfilled.',
        ]),
        eventsMaxLen: BROKER_EMIT_MAXLEN,
      },
      CallbackContextCtor: CallbackContext,
    }
  );

  broker.onErrorCallback = (event, err) => {
    logger.debug({ event, err });
  };

  return broker;
}
export interface EventMetrics {
  pending: PendingEvents;
}
export async function getMetrics(broker: Broker): Promise<EventMetrics> {
  return {
    pending: await broker.pending(),
  };
}
