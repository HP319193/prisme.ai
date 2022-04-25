import waitForExpect from 'wait-for-expect';

import Runtime from '.';
import { Broker } from '@prisme.ai/broker/lib/__mocks__';
import { EventSource } from '@prisme.ai/broker';
import { Workspaces } from '../workspaces';
import { DriverType } from '../../storage/types';
import { FilesystemOptions } from '../../storage/drivers/filesystem';
import path from 'path';
import { Apps } from '../apps';
import Cache from '../../cache/__mocks__/cache';
import { AvailableModels } from '../workspaces/__mocks__/workspaces';
import { RUNTIME_EMITS_BROKER_TOPIC } from '../../../config';
import { EventType } from '../../eda';

global.console.warn = jest.fn();

const sleep = async (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

let brokers = [];

const getMocks = (
  partialSource: Partial<EventSource>,
  mockExecuteAutomation: boolean = true
) => {
  const parentBroker = new Broker();
  const broker = parentBroker.child(partialSource, {
    forceTopic: RUNTIME_EMITS_BROKER_TOPIC,
    validateEvents: false,
  });

  const modelsStorage: FilesystemOptions = {
    dirpath: path.join(__dirname, '../workspaces/__mocks__/'),
  };

  const apps = new Apps(DriverType.FILESYSTEM, modelsStorage);
  const workspaces = new Workspaces(
    DriverType.FILESYSTEM,
    modelsStorage,
    apps,
    broker as any
  );
  const runtime = new Runtime(broker as any, workspaces, new Cache());

  brokers.push(broker);

  if (mockExecuteAutomation) {
    (runtime as any).executeAutomation = jest.fn();
  }

  return {
    broker,
    runtime,
    sendEventSpy: jest.spyOn(broker, '_send'),
    processEventSpy: jest.spyOn(runtime, 'processEvent'),
    executeAutomationSpy: mockExecuteAutomation
      ? (runtime as any).executeAutomation
      : jest.spyOn(runtime as any, 'executeAutomation'),
  };
};

describe('Simple events processing', () => {
  it('Basic event automation executes with good event payload, contexts & child broker', async () => {
    const userId = 'unitTest';
    const { broker, runtime, executeAutomationSpy } = getMocks({
      workspaceId: AvailableModels.Basic,
      userId,
    });
    broker.start();
    runtime.start();

    const event = broker.send('run.empty', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      // Test workspace
      expect(executeAutomationSpy).toBeCalledWith(
        expect.objectContaining({
          name: AvailableModels.Basic,
        }),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything()
      );

      // Test Automation
      expect(executeAutomationSpy).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          slug: 'empty',
        }),
        expect.anything(),
        expect.anything(),
        expect.anything()
      );

      // Test Contexts
      expect(executeAutomationSpy).toBeCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          correlationId: event.source.correlationId,
          userId,
          appContext: undefined,
          automationSlug: 'empty',
          depth: 0,
          payload: {
            source: event.source,
            payload: event.payload,
          },
          contexts: expect.objectContaining({
            user: expect.objectContaining({
              id: userId,
            }),
            global: expect.objectContaining({
              workspaceId: AvailableModels.Basic,
            }),
          }),
        }),
        expect.anything(),
        expect.anything()
      );

      // Test broker
      expect(executeAutomationSpy).toBeCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          parentSource: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            workspaceId: AvailableModels.Basic,
            automationSlug: 'empty',
          }),
          forceTopic: RUNTIME_EMITS_BROKER_TOPIC,
        })
      );
    });
  });

  it('N+1 AppInstance automation triggered by event', async () => {
    const userId = 'unitTest';
    const { broker, runtime, executeAutomationSpy } = getMocks({
      workspaceId: AvailableModels.Imports,
      userId,
    });
    broker.start();
    runtime.start();

    const event = broker.send('basicApp.triggerEmpty', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(executeAutomationSpy).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          slug: 'basicEmpty',
          workspace: expect.objectContaining({
            name: AvailableModels.BasicApp,
          }),
        }),
        expect.anything(),
        expect.anything(),
        expect.anything()
      );

      // Test Contexts
      expect(executeAutomationSpy).toBeCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          correlationId: event.source.correlationId,
          userId,
          appContext: expect.objectContaining({
            appSlug: AvailableModels.BasicApp,
            appInstanceSlug: 'basicApp',
            appInstanceFullSlug: 'basicApp',
          }),
          automationSlug: 'basicEmpty',
          payload: {
            source: event.source,
            payload: event.payload,
          },
          contexts: expect.objectContaining({
            user: expect.objectContaining({
              id: userId,
            }),
            global: expect.objectContaining({
              workspaceId: AvailableModels.Imports,
            }),
          }),
        }),
        expect.anything(),
        expect.anything()
      );
    });
  });
});

describe('Simple execution', () => {
  it('Empty automation with an hardcoded output', async () => {
    const userId = 'unitTest';
    const { broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Basic,
        userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = broker.send('run.empty', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'empty',
          }),
          payload: expect.objectContaining({
            slug: 'empty',
            payload: {
              source: event.source,
              payload: event.payload,
            },
            output: {
              foo: 'bar',
            },
          }),
        })
      );
    });
  });

  it('Calls another automation by instruction', async () => {
    const userId = 'unitTest';
    const { broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Basic,
        userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = broker.send('callsAnotherAutomation', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'anotherAutomation',
          }),
          payload: expect.objectContaining({
            slug: 'anotherAutomation',
            payload: expect.objectContaining({
              payload: event.payload,
            }),
            output: event.payload,
          }),
        })
      );
    });
  });

  it('Triggers another automation by emit', async () => {
    const userId = 'unitTest';
    const { broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Basic,
        userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = broker.send('triggerAnotherAutomation', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'anotherAutomation',
          }),
          payload: expect.objectContaining({
            slug: 'anotherAutomation',
            payload: expect.objectContaining({
              payload: event.payload,
            }),
            output: event.payload,
          }),
        })
      );
    });
  });

  it('Execution errors are reported with error events', async () => {
    const userId = 'unitTest';
    const { broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Basic,
        userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = broker.send('throw', {});

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.Error,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'error',
          }),
          error: expect.objectContaining({
            error: 'ObjectNotFoundError',
          }),
        })
      );
    });
  });
});

describe('Simple execution with appInstances', () => {
  it('Empty automation with an hardcoded output', async () => {
    const userId = 'unitTest';
    const { broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Imports,
        userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = broker.send('run.empty', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: 'basicApp.triggerEmpty',
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'empty',
            workspaceId: AvailableModels.Imports,
          }),
          payload: { foo: 'blah' },
        })
      );

      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'basicEmpty',
            appInstanceFullSlug: 'basicApp',
          }),
          payload: expect.objectContaining({
            slug: 'basicEmpty',
            output: {
              msg: 'result of basicApp.basicEmpty',
            },
          }),
        })
      );
    });
  });

  it('Calls another automation by instruction', async () => {
    const userId = 'unitTest';
    const { broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Imports,
        userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = broker.send('basicApp.callsAnotherAutomation', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            appInstanceFullSlug: 'basicApp',
            appSlug: 'basicApp',
            automationSlug: 'anotherAutomation',
          }),
          payload: expect.objectContaining({
            slug: 'anotherAutomation',
            payload: expect.objectContaining({
              payload: event.payload,
            }),
            output: {
              fromAppInstance: event.payload,
            },
          }),
        })
      );
    });
  });

  it('Triggers another automation by emit', async () => {
    const userId = 'unitTest';
    const { broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Imports,
        userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = broker.send('basicApp.triggerAnotherAutomation', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            appInstanceFullSlug: 'basicApp',
            appSlug: 'basicApp',
            automationSlug: 'anotherAutomation',
          }),
          payload: expect.objectContaining({
            slug: 'anotherAutomation',
            payload: expect.objectContaining({
              payload: event.payload,
            }),
            output: {
              fromAppInstance: event.payload,
            },
          }),
        })
      );
    });
  });

  it('Triggers a parent automation by emit', async () => {
    const userId = 'unitTest';
    const { broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Imports,
        userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = broker.send('basicApp.triggerAnotherAutomation', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: 'basicApp.forParentWorkspace',
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            appInstanceFullSlug: 'basicApp',
            appSlug: 'basicApp',
            automationSlug: 'anotherAutomation',
          }),
          payload: expect.objectContaining({
            sourceAutomation: 'anotherAutomation',
          }),
        })
      );

      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            appInstanceFullSlug: undefined,
            appSlug: undefined,
            automationSlug: 'listenBasicAppEvents',
          }),
          payload: expect.objectContaining({
            slug: 'listenBasicAppEvents',
            payload: expect.objectContaining({
              payload: expect.objectContaining({
                sourceAutomation: 'anotherAutomation',
              }),
            }),
            output: expect.objectContaining({
              sourceAutomation: 'anotherAutomation',
            }),
          }),
        })
      );
    });
  });

  it('Call a child automation that will trigger by event some automation from current workspace', async () => {
    const userId = 'unitTest';
    const { broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Imports,
        userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = broker.send('callChildAutomation', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: 'basicApp.forParentWorkspace',
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            appInstanceFullSlug: 'basicApp',
            appSlug: 'basicApp',
            automationSlug: 'anotherAutomation',
          }),
          payload: expect.objectContaining({
            sourceAutomation: 'anotherAutomation',
            sourcePayload: {
              user: userId,
            },
          }),
        })
      );

      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            appInstanceFullSlug: undefined,
            appSlug: undefined,
            automationSlug: 'listenBasicAppEvents',
          }),
          payload: expect.objectContaining({
            slug: 'listenBasicAppEvents',
            payload: expect.objectContaining({
              payload: {
                sourceAutomation: 'anotherAutomation',
                sourcePayload: {
                  user: userId,
                },
              },
            }),
            output: {
              sourceAutomation: 'anotherAutomation',
              sourcePayload: {
                user: userId,
              },
            },
          }),
        })
      );
    });
  });

  it('Execution errors are reported with error events', async () => {
    const userId = 'unitTest';
    const { broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Imports,
        userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = broker.send('basicApp.throw', {});

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.Error,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'throw',
            appInstanceFullSlug: 'basicApp',
          }),
          error: expect.objectContaining({
            error: 'ObjectNotFoundError',
          }),
        })
      );
    });
  });
});

afterAll(async () => {
  brokers.forEach((broker) => broker.close());
});
