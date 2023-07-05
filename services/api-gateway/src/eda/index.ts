import { Broker, PendingEvents, PrismeEvent } from '@prisme.ai/broker';

import { eda as edaConfig } from '../config';
import { Logger, logger } from '../logger';

const {
  APP_NAME,
  BROKER_DRIVER,
  BROKER_HOST,
  BROKER_PASSWORD,
  EVENTS_OAS_PATH,
  BROKER_WHITELIST_EVENT_PREFIXES,
  BROKER_NAMESPACE,
  BROKER_TOPIC_MAXLEN,
} = edaConfig;

export enum EventType {
  Error = 'error',
  SucceededLogin = 'gateway.login.succeeded',
  FailedLogin = 'gateway.login.failed',
  FailedMFA = 'gateway.mfa.failed',
  SucceededSignup = 'gateway.signup.succeeded',
  SucceededPasswordResetRequested = 'gateway.passwordReset.requested',
  SucceededPasswordReset = 'gateway.passwordReset.succeeded',

  UpdatedWorkspaceSecurity = 'workspaces.security.updated',
  CreatedWorkspace = 'workspaces.created',
  UpdatedWorkspace = 'workspaces.updated',
  DeletedWorkspace = 'workspaces.deleted',
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

export async function initBroker() {}

export interface EventMetrics {
  pending: PendingEvents;
}
export async function getMetrics(): Promise<EventMetrics> {
  return {
    pending: await broker.pending(),
  };
}
