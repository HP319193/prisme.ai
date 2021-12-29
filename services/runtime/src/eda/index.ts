import { Broker, PendingEvents, PrismeEvent } from "@prisme.ai/broker";

import {
  APP_NAME,
  BROKER_DRIVER,
  BROKER_HOST,
  BROKER_PASSWORD,
  EVENTS_OAS_PATH,
} from "../../config";
import { Logger, logger } from "../logger";

export enum EventType {
  Error = "error",
  TriggeredWorkflow = "runtime.workflow.triggered",
  UpdatedContexts = "runtime.contexts.updated",
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

export async function initBroker() {
  broker.on(EventType.Error, async (event, broker, { logger }) => {
    logger.error(event);
    return true;
  });
}

export interface EventMetrics {
  pending: PendingEvents;
}
export async function getMetrics(): Promise<EventMetrics> {
  return {
    pending: await broker.pending(),
  };
}
