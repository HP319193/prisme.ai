import { Broker, PendingEvents, PrismeEvent } from '@prisme.ai/broker';

import {
  APP_NAME,
  BROKER_DRIVER,
  BROKER_HOST,
  BROKER_NAMESPACE,
  BROKER_PASSWORD,
  BROKER_TOPIC_MAXLEN,
  BROKER_WHITELIST_EVENT_PREFIXES,
  EVENTS_OAS_PATH,
} from '../../config';
import { Logger, logger } from '../logger';

export enum EventType {
  Error = 'error',

  CreatedWorkspace = 'workspaces.created',
  ImportedWorkspace = 'workspaces.imported',
  ConfiguredWorkspace = 'workspaces.configured',
  UpdatedWorkspace = 'workspaces.updated',
  DeletedWorkspace = 'workspaces.deleted',
  UpdatedWorkspaceSecurity = 'workspaces.security.updated',

  PublishedWorkspaceVersion = 'workspaces.versions.published',
  DeletedWorkspaceVersion = 'workspaces.versions.deleted',
  RollbackWorkspaceVersion = 'workspaces.versions.rollback',

  DuplicatedWorkspace = 'workspaces.duplicated',

  WorkspacePermissionsShared = 'workspaces.permissions.shared',
  WorkspacePermissionsDeleted = 'workspaces.permissions.deleted',

  InstalledApp = 'workspaces.apps.installed',
  UninstalledApp = 'workspaces.apps.uninstalled',
  ConfiguredApp = 'workspaces.apps.configured',

  CreatedAutomation = 'workspaces.automations.created',
  UpdatedAutomation = 'workspaces.automations.updated',
  DeletedAutomation = 'workspaces.automations.deleted',

  PublishedApp = 'apps.published',
  DeletedApp = 'apps.deleted',

  CreatedPage = 'workspaces.pages.created',
  UpdatedPage = 'workspaces.pages.updated',
  DeletedPage = 'workspaces.pages.deleted',

  UpdatedBlocks = 'workspaces.blocks.updated',

  PagePermissionsShared = 'workspaces.pages.permissions.shared',
  PagePermissionsDeleted = 'workspaces.pages.permissions.deleted',

  UpdatedContexts = 'runtime.contexts.updated',
}

export class CallbackContext {
  public logger: Logger;

  constructor(event: PrismeEvent) {
    this.logger = logger.child(event.source);
  }
}

export function initEDA() {
  const broker = new Broker<CallbackContext>(
    {
      service: APP_NAME,
    },
    {
      driver: {
        type: BROKER_DRIVER,
        host: BROKER_HOST,
        password: BROKER_PASSWORD,
        namespace: BROKER_NAMESPACE,
        topicsMaxLen: BROKER_TOPIC_MAXLEN,
      },
      validator: {
        oasFilepath: EVENTS_OAS_PATH,
        whitelistEventPrefixes: BROKER_WHITELIST_EVENT_PREFIXES,
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
