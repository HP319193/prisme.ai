import { Broker, PendingEvents, PrismeEvent } from '@prisme.ai/broker';

import {
  APP_NAME,
  BROKER_DRIVER,
  BROKER_EMIT_MAXLEN,
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
  UpdatedWorkspace = 'workspaces.updated',
  UpdatedWorkspaceSecurity = 'workspaces.security.updated',
  DeletedWorkspace = 'workspaces.deleted',
  InstalledApp = 'workspaces.apps.installed',
  ConfiguredApp = 'workspaces.apps.configured',
  CreatedAutomation = 'workspaces.automations.created',
  UpdatedAutomation = 'workspaces.automations.updated',
  DeletedAutomation = 'workspaces.automations.deleted',

  CreatedUserTopic = 'events.userTopics.created',
  JoinedUserTopic = 'events.userTopics.joined',

  ExecutedAutomation = 'runtime.automations.executed',
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
      eventsMaxLen: BROKER_EMIT_MAXLEN,
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
