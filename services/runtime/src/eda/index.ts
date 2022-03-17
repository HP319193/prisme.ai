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
} from '../../config';
import { Logger, logger } from '../logger';

export enum EventType {
  Error = 'error',
  ExecutedAutomation = 'runtime.automations.executed',
  TriggeredWebhook = 'runtime.webhooks.triggered',
  UpdatedContexts = 'runtime.contexts.updated',

  CreatedWorkspace = 'workspaces.created',
  ConfiguredWorkspace = 'workspaces.configured',
  UpdatedWorkspace = 'workspaces.updated',
  DeletedWorkspace = 'workspaces.deleted',
  CreatedAutomation = 'workspaces.automations.created',
  UpdatedAutomation = 'workspaces.automations.updated',
  DeletedAutomation = 'workspaces.automations.deleted',

  InstalledApp = 'workspaces.apps.installed',
  UninstalledApp = 'workspaces.apps.uninstalled',
  ConfiguredApp = 'workspaces.apps.configured',

  DeletedApp = 'apps.deleted',
  PublishedApp = 'apps.published',
}
export class CallbackContext {
  public logger: Logger;

  constructor(event: PrismeEvent) {
    this.logger = logger.child(event.source);
  }
}

export const broker = new Broker<CallbackContext>(
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

export interface EventMetrics {
  pending: PendingEvents;
}
export async function getMetrics(): Promise<EventMetrics> {
  return {
    pending: await broker.pending(),
  };
}
