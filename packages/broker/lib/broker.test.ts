import path from "path";
import crypto from "crypto";
import {
  Broker,
  PrismeEvent,
  EventSource,
  NativeTopic,
  BrokerError,
} from "../index";
import { SubscriptionOptions } from "./drivers";

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

enum EventType {
  Error = "error",
  SucceededLogin = "gateway.login.succeeded",
  FailedLogin = "gateway.login.failed",
  InstalledApp = "workspaces.app.installed",
  ConfiguredApp = "workspaces.app.configured",
  TriggeredWorkflow = "runtime.workflow.triggered",
  UpdatedContexts = "runtime.contexts.updated",
}
const appInstanceEvent = {
  app: "",
  name: "",
};
const loginEvent = {
  ip: "",
  attempt: 1,
};
const triggeredWorkflowEvent = {
  event: {},
  workflow: "",
};
const updatedContextsEvent = {
  contexts: {
    session: {
      hello: "world",
    },
  },
};

jest.setTimeout(10000);

class CallbackContext {
  public context: EventSource;

  constructor(event: PrismeEvent) {
    this.context = event.source;
  }
}

let createdBrokers: Broker<CallbackContext>[] = [];
async function getBrokers(
  services: Record<string, number>,
  settings?: Record<string, Partial<SubscriptionOptions>>
): Promise<Record<string, Broker<CallbackContext>[]>> {
  const prefix = crypto.randomBytes(2).toString("hex") + "_";
  const brokers: Record<string, Broker<CallbackContext>[]> = {};
  for (const [service, count] of Object.entries(services)) {
    brokers[service] = Array.apply(null, new Array(count)).map(
      (_: any, idx: number) =>
        new Broker<CallbackContext>(
          { service: service, name: `${service}${count}` },
          {
            driver: {
              type: "redis",
              host: process.env.BROKER_HOST || "redis://localhost:6379/10",
              subscription: {
                ...(settings?.[service] || {}),
              },
              namespace: prefix,
            },
            validator: {
              oasFilepath:
                process.env.EVENTS_OAS_PATH ||
                path.resolve(__dirname, "../openapi/events.yml"),
              whitelistEventPrefixes: ["tests."],
            },
            CallbackContextCtor: CallbackContext,
          }
        )
    );
    createdBrokers.push(...brokers[service]);
    await Promise.all(brokers[service].map((cur) => cur.ready));
  }

  return brokers;
}

const maxTimeout = async (timeout: number, ...promises: Promise<any>[]) =>
  Promise.any([
    Promise.all(promises),
    new Promise((resolve) => setTimeout(() => resolve(false), timeout)),
  ]).then((rets) =>
    Array.isArray(rets) && rets.length === 1 ? rets[0] : rets
  );
const sleep = async (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const timeout = 200;

describe("Event validation & callback errors", () => {
  it("Should raise a validation exception", async () => {
    const {
      dsul: [brokerDSUL],
    } = await getBrokers({ dsul: 1 });
    const resp = brokerDSUL.send(EventType.FailedLogin, {});
    await expect(resp).rejects.toThrow();
  });

  it("Should emit an generic Error event when callback raises", async () => {
    const {
      nlu: [brokerNLU1],
      dsul: [brokerDSUL],
    } = await getBrokers({ nlu: 1, dsul: 1 });
    const error = new BrokerError("oops", { foo: "some details" });
    let fullMessageEvent: PrismeEvent;
    brokerNLU1.on(
      EventType.FailedLogin,
      (event) => {
        fullMessageEvent = event;
        throw error;
      },
      {
        ListenOnlyOnce: true,
      }
    );
    const promise = maxTimeout(
      400,
      new Promise((resolve) => {
        brokerDSUL.on(
          EventType.Error,
          (event) => {
            resolve(event);
            return true;
          },
          {
            ListenOnlyOnce: true,
          }
        );
      })
    );
    await brokerDSUL.send(EventType.FailedLogin, loginEvent);
    return promise.then((event: PrismeEvent) => {
      expect(event).not.toBe(false);
      expect(event.error).toMatchObject(error.toJSON());
      expect(event.source?.host?.service).toBe(brokerNLU1.service);
      // Correlation id, user id & workspace id should remain the same as in the event that made the callback throw
      expect(event.source.correlationId).toBe(
        fullMessageEvent?.source?.correlationId
      );
      expect(event.source.userId).toBe(fullMessageEvent?.source?.userId);
      expect(event.source.workspaceId).toBe(
        fullMessageEvent?.source?.workspaceId
      );
    });
  });

  it("A child broker should be passed to callbacks in order to keep same source", async () => {
    const {
      nlu: [brokerNLU1],
      dsul: [brokerDSUL],
      analytics: [brokerAnalytics1],
    } = await getBrokers({ nlu: 1, dsul: 1, analytics: 1 });

    const cascadingEventPromise = maxTimeout(
      400,
      new Promise((resolve) => {
        brokerAnalytics1.on(
          EventType.ConfiguredApp,
          (event) => {
            resolve(event);
            return true;
          },
          {
            GroupPartitions: false,
            ListenOnlyOnce: true, // Otherwise would catch other tests events
          }
        );
      })
    );
    // When receive first event, send the second one tested above
    let correlationId: string;
    brokerNLU1.on(
      EventType.InstalledApp,
      (event, broker, ctx) => {
        correlationId = event.source.correlationId as string;
        expect(broker).toBeInstanceOf(Broker);
        broker.send(EventType.ConfiguredApp, appInstanceEvent);
        expect(broker).toBeInstanceOf(CallbackContext);
        return true;
      },
      {
        GroupPartitions: false,
        ListenOnlyOnce: true, // Otherwise would catch other tests events
      }
    );
    const source = {
      userId: "someUserId",
      workspaceId: "someWorkspaceId",
    };
    brokerDSUL.send(EventType.InstalledApp, appInstanceEvent, source);
    return cascadingEventPromise.then((event: PrismeEvent) => {
      expect(event).not.toBe(false);
      // These should be the same as in the initial event
      expect(event.source.correlationId).toBe(correlationId);
      expect(event.source.userId).toMatch(source.userId);
      expect(event.source.workspaceId).toMatch(source.workspaceId);
      // These however should be updated with last sender
      expect(event.source?.host?.service).toMatch(brokerNLU1.service);
    });
  });

  it("Unacknowledged events read by a consumer group should be set as pending", async () => {
    const {
      nlu: [brokerNLU1],
      dsul: [brokerDSUL],
    } = await getBrokers({ nlu: 1, dsul: 1 });

    brokerNLU1.on(EventType.TriggeredWorkflow, () => false);
    brokerNLU1.on(EventType.SucceededLogin, () => false);
    const initialPending = await brokerNLU1.pending();
    await Promise.all([
      brokerDSUL.send(EventType.TriggeredWorkflow, triggeredWorkflowEvent),
      brokerDSUL.send(EventType.TriggeredWorkflow, triggeredWorkflowEvent),
      brokerDSUL.send(EventType.SucceededLogin, loginEvent),
    ]);
    await sleep(100);
    const pending = await brokerNLU1.pending();
    expect(pending.total - initialPending.total).toBe(3);
    expect(
      (pending.events.find((cur) => cur.type === EventType.SucceededLogin)
        ?.pending || 0) -
        (initialPending.events.find(
          (cur) => cur.type === EventType.SucceededLogin
        )?.pending || 0)
    ).toBe(1);
    expect(
      (pending.events.find((cur) => cur.type === EventType.TriggeredWorkflow)
        ?.pending || 0) -
        (initialPending.events.find(
          (cur) => cur.type === EventType.TriggeredWorkflow
        )?.pending || 0)
    ).toBe(2);
  });
});

describe("Basic messaging without partitions", () => {
  it(`Broker should send & receive < ${timeout}ms without partition, & with source field properly filled`, async () => {
    const {
      nlu: [brokerNLU1],
      analytics: [brokerAnalytics1],
    } = await getBrokers({ nlu: 1, analytics: 1 });

    return maxTimeout(
      timeout,
      new Promise(async (resolve) => {
        brokerNLU1.on(
          EventType.UpdatedContexts,
          (event) => {
            resolve(event);
            return true;
          },
          {
            GroupPartitions: false,
            ListenOnlyOnce: true, // Otherwise would catch other tests events
          }
        );

        brokerAnalytics1
          .send(EventType.UpdatedContexts, updatedContextsEvent)
          .then((sent) => {
            expect(sent?.payload).toMatchObject(updatedContextsEvent);
          });
      })
    ).then((event) => {
      expect(event).not.toBe(false);
      expect(event?.type).toBe(EventType.UpdatedContexts);
      expect(event?.payload?.contexts?.session?.hello).toBe("world");
      expect(event?.source?.host?.service).toBe(brokerAnalytics1.service);
      expect(typeof event?.source?.host?.ip).toBe("string");
      expect(typeof event?.createdAt).toBe("string");
      expect(typeof event?.source.correlationId).toBe("string");
      expect(event?.source.correlationId).toMatch(
        new RegExp("[a-zA-Z0-9_-]{16,}")
      );
    });
  });

  it(`Caller might listen to multiple topics with the same call on()`, async () => {
    const {
      nlu: [brokerNLU1],
      analytics: [brokerAnalytics1],
    } = await getBrokers({ nlu: 1, analytics: 1 });

    const willSend = {
      ["tests.one"]: 1,
      ["tests.three"]: 3,
      ["tests.two"]: 2,
    };

    const received: Record<string, number> = {
      ["tests.one"]: 0,
      ["tests.three"]: 0,
      ["tests.two"]: 0,
    };

    return maxTimeout(
      timeout * 2,
      new Promise(async (resolve) => {
        const updateReceived = (event: PrismeEvent) => {
          received[event.type] = (received[event.type] || 0) + 1;
          if (JSON.stringify(received) == JSON.stringify(willSend)) {
            resolve(true);
          }
        };
        brokerNLU1.on(
          Object.keys(willSend),
          (event) => {
            updateReceived(event);
            return true;
          },
          {
            GroupPartitions: false,
          }
        );

        const sendingQueue = Object.entries(willSend)
          .map(([topic, count]) =>
            Array.apply(null, Array(count)).map(() => topic)
          )
          .flat()
          .sort((a, b) => 0.5 - Math.random());
        for (const topic of sendingQueue) {
          await brokerAnalytics1.send(topic, {});
        }
      })
    ).then((success) => {
      expect(received).toMatchObject(willSend);
    });
  });

  it(`All listeners should receive`, async () => {
    const {
      nlu: [brokerNLU1, brokerNLU2],
      dsul: [brokerDSUL],
    } = await getBrokers({ nlu: 2, dsul: 1 });

    return maxTimeout(
      timeout,
      new Promise(async (resolve) => {
        brokerNLU1.on(
          EventType.UpdatedContexts,
          (event) => {
            resolve(event);
            return true;
          },
          {
            GroupPartitions: false,
            ListenOnlyOnce: true, // Otherwise would catch other tests events
          }
        );
      }),
      new Promise(async (resolve) => {
        brokerNLU2.on(
          EventType.UpdatedContexts,
          (event) => {
            resolve(event);
            return true;
          },
          {
            GroupPartitions: false,
            ListenOnlyOnce: true, // Otherwise would catch other tests events
          }
        );
      }),

      brokerDSUL.send(EventType.UpdatedContexts, updatedContextsEvent)
    ).then((results) => {
      expect(typeof results?.[0]?.id).toBe("string");
      expect(results?.[0]?.id).toBe(results?.[1]?.id);
    });
  });

  it(`Caller can listen to every existing topic with all() method`, async () => {
    const {
      nlu: [brokerNLU1],
      analytics: [brokerAnalytics1],
    } = await getBrokers({ nlu: 2, analytics: 1 });

    const willSend = {
      ["tests.one"]: 1,
      ["tests.three"]: 3,
      ["tests.two"]: 2,
    };

    const received: Record<string, number> = {
      ["tests.one"]: 0,
      ["tests.three"]: 0,
      ["tests.two"]: 0,
    };

    return maxTimeout(
      timeout,
      new Promise(async (resolve) => {
        const updateReceived = (event: PrismeEvent) => {
          received[event.type] = (received[event.type] || 0) + 1;
          if (JSON.stringify(received) == JSON.stringify(willSend)) {
            resolve(true);
          }
        };
        brokerNLU1.all(
          (event) => {
            updateReceived(event);
            return true;
          },
          {
            GroupPartitions: false,
          }
        );

        const sendingQueue = Object.entries(willSend)
          .map(([topic, count]) =>
            Array.apply(null, Array(count)).map(() => topic)
          )
          .flat()
          .sort((a, b) => 0.5 - Math.random());
        for (const topic of sendingQueue) {
          await brokerAnalytics1.send(topic, {});
        }
      })
    ).then((success) => {
      expect(received).toMatchObject(willSend);
    });
  });
});

describe("Basic messaging with partitions", () => {
  it(`Broker should send & receive < ${timeout}ms with partition`, async () => {
    const {
      nlu: [brokerNLU1],
      dsul: [brokerDSUL],
    } = await getBrokers({ nlu: 1, dsul: 1 });

    return maxTimeout(
      timeout,
      new Promise(async (resolve) => {
        brokerNLU1.on(
          EventType.UpdatedContexts,
          (event) => {
            resolve(event);
            return true;
          },
          {
            ListenOnlyOnce: true,
          }
        );
        brokerDSUL
          .send(EventType.UpdatedContexts, updatedContextsEvent)
          .then((sent) => {
            expect(sent?.payload).toMatchObject(updatedContextsEvent);
          });
      })
    ).then((event) => {
      expect(event).not.toBe(false);
      expect(event?.payload?.contexts?.session?.hello).toBe("world");
    });
  });

  it(`Should be received by a single instance of the same group`, async () => {
    const {
      nlu: [brokerNLU1, brokerNLU2],
      dsul: [brokerDSUL],
    } = await getBrokers({ nlu: 2, dsul: 1 });
    const promise = Promise.all([
      maxTimeout(
        timeout,
        new Promise(async (resolve) => {
          brokerNLU1.on(
            EventType.TriggeredWorkflow,
            (event) => {
              resolve(event);
              return true;
            },
            {
              ListenOnlyOnce: true, // Otherwise would catch other tests events
            }
          );
        })
      ),
      maxTimeout(
        timeout,
        new Promise(async (resolve) => {
          brokerNLU2.on(
            EventType.TriggeredWorkflow,
            (event) => {
              resolve(event);
              return true;
            },
            {
              ListenOnlyOnce: true, // Otherwise would catch other tests events
            }
          );
        })
      ),
    ]).then((events) => {
      expect(events.filter(Boolean).length).toBe(1);
    });
    brokerDSUL.send(EventType.TriggeredWorkflow, triggeredWorkflowEvent);
    return promise;
  });

  it(`Should receive an event sent to a given topic`, async () => {
    const {
      nlu: [brokerNLU1],
      dsul: [brokerDSUL],
    } = await getBrokers({ nlu: 1, dsul: 1 });

    const topic = "someCustomTopic";
    return maxTimeout(
      2000,
      new Promise(async (resolve) => {
        brokerNLU1.on(topic, (event) => {
          resolve(event);
          return true;
        });
        await brokerDSUL.send(
          EventType.InstalledApp,
          appInstanceEvent,
          undefined,
          topic
        );
      })
    ).then((results) => {
      expect(results).not.toBe(false);
      expect(results.source.topic).toBe(topic);
      expect(results.type).toBe(EventType.InstalledApp);
    });
  });

  it(`Caller might listen to multiple topics with the same call on() and with partitions`, async () => {
    const {
      nlu: [brokerNLU1, brokerNLU2],
      analytics: [brokerAnalytics1],
    } = await getBrokers({ nlu: 2, analytics: 1 });

    const willSend = {
      ["tests.one"]: 1,
      ["tests.three"]: 3,
      ["tests.two"]: 2,
    };

    const received: Record<string, number> = {
      ["tests.one"]: 0,
      ["tests.three"]: 0,
      ["tests.two"]: 0,
    };

    return maxTimeout(
      timeout * 2,
      new Promise(async (resolve) => {
        const updateReceived = (event: PrismeEvent) => {
          received[event.type] = (received[event.type] || 0) + 1;
          if (JSON.stringify(received) == JSON.stringify(willSend)) {
            resolve(true);
          }
        };
        brokerNLU1.on(Object.keys(willSend), (event) => {
          updateReceived(event);
          return true;
        });

        brokerNLU2.on(Object.keys(willSend), (event) => {
          updateReceived(event);
          return true;
        });

        const sendingQueue = Object.entries(willSend)
          .map(([topic, count]) =>
            Array.apply(null, Array(count)).map(() => topic)
          )
          .flat()
          .sort((a, b) => 0.5 - Math.random());
        for (const topic of sendingQueue) {
          await brokerAnalytics1.send(topic, {});
        }
      })
    ).then((success) => {
      expect(received).toMatchObject(willSend);
    });
  });

  it(`Caller can listen to every existing topic with all() method`, async () => {
    const {
      nlu: [brokerNLU1, brokerNLU2],
      analytics: [brokerAnalytics1],
    } = await getBrokers({ nlu: 2, analytics: 1 });

    const willSend = {
      ["tests.one"]: 1,
      ["tests.three"]: 3,
      ["tests.two"]: 2,
    };

    const received: Record<string, number> = {
      ["tests.one"]: 0,
      ["tests.three"]: 0,
      ["tests.two"]: 0,
    };

    return maxTimeout(
      timeout,
      new Promise(async (resolve) => {
        const updateReceived = (event: PrismeEvent) => {
          received[event.type] = (received[event.type] || 0) + 1;
          if (JSON.stringify(received) == JSON.stringify(willSend)) {
            resolve(true);
          }
        };

        // As we are in partition mode, each broker should rcv a different subset of sent events
        brokerNLU1.all((event) => {
          updateReceived(event);
          return true;
        });
        brokerNLU2.all((event) => {
          updateReceived(event);
          return true;
        });

        const sendingQueue = Object.entries(willSend)
          .map(([topic, count]) =>
            Array.apply(null, Array(count)).map(() => topic)
          )
          .flat()
          .sort((a, b) => 0.5 - Math.random());
        for (const topic of sendingQueue) {
          await brokerAnalytics1.send(topic, {});
        }
      })
    ).then((success) => {
      expect(received).toMatchObject(willSend);
    });
  });
});

describe("More complex messaging spread over time", () => {
  const msgsToSend = 10;
  it(`${msgsToSend} messages sent to 1 group of 2 instances + 2 other instances listening without group`, async () => {
    const {
      nlu: [brokerNLU1, brokerNLU2],
      analytics: [brokerAnalytics1, brokerAnalytics2],
      dsul: [brokerDSUL],
    } = await getBrokers(
      { nlu: 2, analytics: 2, dsul: 1 },
      {
        analytics: {
          GroupPartitions: false,
        },
      }
    );

    const consumers = [
      brokerNLU1,
      brokerNLU2,
      brokerAnalytics1,
      brokerAnalytics2,
    ];

    const msgsThatShouldBeReceived = msgsToSend + msgsToSend * 2; // nlu + analytics
    let msgsReceived = 0;
    const consumerIdToevents: Record<string, PrismeEvent[]> = {};
    consumers.forEach((cur) => {
      cur.on(EventType.TriggeredWorkflow, (event) => {
        const consumerId = cur.consumer.name;
        if (!(consumerId in consumerIdToevents)) {
          consumerIdToevents[consumerId] = [];
        }
        consumerIdToevents[consumerId].push(event);
        msgsReceived++;
        return true;
      });
    });

    let msgsSent = 0;
    for (let i = 0; i < msgsToSend; i++) {
      try {
        const event = await brokerDSUL.send(
          EventType.TriggeredWorkflow,
          triggeredWorkflowEvent
        );
        msgsSent++;
      } catch (error) {}
      const delay = Math.round(Math.random() * 100);
      await sleep(delay);
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(msgsReceived), 2000);
      const check = () => {
        if (msgsReceived == msgsThatShouldBeReceived) {
          resolve(msgsReceived);
        }
      };
      setInterval(check, 100);
    }).then((msgsReceived) => {
      expect(msgsSent).toBe(msgsToSend);
      expect(msgsReceived).toBe(msgsThatShouldBeReceived);
    });
  });
});

afterAll(async () => {
  return Promise.all(createdBrokers.map((cur) => cur.close()));
});
