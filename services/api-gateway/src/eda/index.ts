import { Broker, PendingEvents, PrismeEvent } from "@prisme.ai/broker";

import { eda as edaConfig } from "../config";
import { Logger, logger } from "../logger";

const {
  APP_NAME,
  BROKER_DRIVER,
  BROKER_HOST,
  BROKER_PASSWORD,
  EVENTS_OAS_PATH,
} = edaConfig;

export enum EventType {
  Error = "error",
  SucceededLogin = "gateway.login.succeeded",
  FailedLogin = "gateway.login.failed",
}
export class CallbackContext {
  public logger: Logger;

  constructor(event: PrismeEvent) {
    this.logger = logger.child(event.source);
  }
}

export const broker = new Broker<CallbackContext>(
  {
    app: APP_NAME,
  },
  {
    driver: {
      type: BROKER_DRIVER,
      host: BROKER_HOST,
      password: BROKER_PASSWORD,
    },
    validator: {
      oasFilepath: EVENTS_OAS_PATH,
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
