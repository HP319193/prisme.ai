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
  SucceededLogin = "gateway.login.succeeded",
  FailedLogin = "gateway.login.failed",
  InstalledApp = "workspaces.app.installed",
  ConfiguredApp = "workspaces.app.configured",
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

  broker.on(EventType.TriggeredWorkflow, async (event, broker, { logger }) => {
    const done = Math.random() > 0.2;
    const duration = Math.random() * 1000;
    await new Promise((resolve) => setTimeout(resolve, duration));
    console.log("rcv", event, " is ", done, " after ", duration);
    return done;
  });

  broker.on(EventType.InstalledApp, async (event, broker, { logger }) => {
    logger.info(event);
    broker.send(EventType.ConfiguredApp, {
      app: "configured app sent from installed app",
      name: "",
    });
    return true;
  });

  broker.on(EventType.ConfiguredApp, async (event, broker, { logger }) => {
    logger.info(event);
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
