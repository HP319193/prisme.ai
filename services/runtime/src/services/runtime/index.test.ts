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

// jest.setTimeout(1000);

global.console.warn = jest.fn();

let brokers: Broker[] = [];

const getMocks = (
  partialSource: Partial<EventSource>,
  mockExecuteAutomation: boolean = true,
  opts?: any
) => {
  const parentBroker = new Broker();
  const broker = parentBroker.child(partialSource, {
    forceTopic: RUNTIME_EMITS_BROKER_TOPIC,
    validateEvents: false,
    ...opts,
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
  workspaces.saveWorkspace = () => Promise.resolve();
  const runtime = new Runtime(broker as any, workspaces, new Cache());

  brokers.push(broker);
  workspaces.startLiveUpdates();

  if (mockExecuteAutomation) {
    (runtime as any).executeAutomation = jest.fn();
  }

  return {
    broker,
    workspaces,
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

    const event = await broker.send('run.empty', {
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
          appContext: undefined,
          automationSlug: 'empty',
          depth: 0,
          payload: {
            id: event.id,
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

    const event = await broker.send('basicApp.triggerEmpty', {
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
          appContext: expect.objectContaining({
            appSlug: AvailableModels.BasicApp,
            appInstanceSlug: 'basicApp',
            appInstanceFullSlug: 'basicApp',
          }),
          automationSlug: 'basicEmpty',
          payload: {
            id: event.id,
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

    const event = await broker.send('run.empty', {
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
              id: event.id,
              source: event.source,
              payload: event.payload,
            },
            trigger: expect.objectContaining({
              type: 'event',
              value: 'run.empty',
            }),
            break: false,
            output: {
              foo: 'bar',
            },
          }),
        })
      );
    });
  });

  it('Config variable contains the config defined by the workspace DSUL', async () => {
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

    const event = await broker.send('config', {});

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'config',
          }),
          payload: expect.objectContaining({
            output: {
              configFrom: 'workspace',
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

    const event = await broker.send('callsAnotherAutomation', {
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
        sessionId: userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = await broker.send('triggerAnotherAutomation', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            sessionId: userId,
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

    const event = await broker.send('throw', {});

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.Error,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'error',
          }),
          payload: expect.objectContaining({
            error: 'ObjectNotFoundError',
          }),
        })
      );
    });
  });
});

describe('More advanced execution with appInstances', () => {
  it('Empty automation with an hardcoded output', async () => {
    const userId = 'unitTest';
    const { broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Imports,
        userId,
        sessionId: userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = await broker.send('run.empty', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: 'basicApp.triggerEmpty',
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId: undefined,
            sessionId: userId,
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
            sessionId: userId,
            automationSlug: 'basicEmpty',
            appInstanceFullSlug: 'basicApp',
          }),
          payload: expect.objectContaining({
            slug: 'basicEmpty',
            trigger: expect.objectContaining({
              type: 'event',
              value: 'triggerEmpty',
            }),
            break: false,
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

    const event = await broker.send('basicApp.callsAnotherAutomation', {
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
        sessionId: userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = await broker.send('basicApp.triggerAnotherAutomation', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            sessionId: userId,
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
        sessionId: userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = await broker.send('basicApp.triggerAnotherAutomation', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: 'basicApp.forParentWorkspace',
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            sessionId: userId,
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
            sessionId: userId,
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
        sessionId: userId,
      },
      false
    );
    broker.start();
    runtime.start();

    const event = await broker.send('callChildAutomation', {
      someRandomId: Math.random() * 1000,
    });

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: 'basicApp.forParentWorkspace',
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            sessionId: userId,
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
            sessionId: userId,
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

    const event = await broker.send('basicApp.throw', {});

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
          payload: expect.objectContaining({
            error: 'ObjectNotFoundError',
          }),
        })
      );
    });
  });

  it('Inside an appInstance, config variable contains at least the source app config', async () => {
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

    const event = await broker.send('basicApp.config', {});

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'config',
            appInstanceFullSlug: 'basicApp',
          }),
          payload: expect.objectContaining({
            output: {
              API_URL: 'https://google.fr',
            },
          }),
        })
      );
    });
  });

  it('Inside an appInstance defining a config, config variable will merge its fields with source app config', async () => {
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

    const event = await broker.send('preconfigured.config', {});

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'config',
            appInstanceFullSlug: 'preconfigured',
          }),
          payload: expect.objectContaining({
            output: {
              API_URL: 'https://google.fr',
              preconfigured: 'variable',
            },
          }),
        })
      );
    });
  });

  it('Config can be transmitted from root workspace to lvl2+ nested app', async () => {
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

    const event = await broker.send('getNestedConfig', {});

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'config',
            appSlug: 'nestedApp',
            appInstanceFullSlug: 'preconfigured.nestedApp',
          }),
          payload: expect.objectContaining({
            output: {
              preconfigured: 'variable',
              API_URL: 'https://google.fr',
              nestedApp: 'someValue',
            },
          }),
        })
      );
    });
  });

  it('Automations can only be called from parent workspace only and no more', async () => {
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

    const event = await broker.send('forbiddenNestedCall', {});

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.Error,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'forbiddenNestedCall',
          }),
          payload: expect.objectContaining({
            error: 'ObjectNotFoundError',
          }),
        })
      );
    });
  });

  it('Private automations can only be called from current workspace and not from parents', async () => {
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

    const event = await broker.send('forbiddenPrivateCall', {});
    const event2 = await broker.send('allowedPrivateCall', {});

    await waitForExpect(() => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.Error,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'forbiddenPrivateCall',
          }),
          payload: expect.objectContaining({
            error: 'ObjectNotFoundError',
          }),
        })
      );

      // But we can call private automations from current workspace
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event2.source.correlationId,
            userId,
            automationSlug: 'privateAutomation',
          }),
          payload: expect.objectContaining({
            output: 'private',
          }),
        })
      );
    });
  });
});

describe("AppInstance's lifecycle events", () => {
  it('Apps can listen to workspaces.apps.installed, and are executed with updated workspace/appInstance', async () => {
    const userId = 'unitTest';
    const { workspaces, broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Basic,
        userId,
      },
      false,
      {
        forceTopic: undefined,
      }
    );
    broker.start();
    runtime.start();
    const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
    const appInstance = {
      appSlug: AvailableModels.BasicApp,
    };

    const event = await broker.send<Prismeai.InstalledAppInstance['payload']>(
      EventType.InstalledApp,
      {
        appInstance,
        slug: appInstance.appSlug,
      },
      {
        workspaceId: workspace.id,
        appInstanceFullSlug: appInstance.appSlug,
      }
    );

    await waitForExpect(async () => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'onInstalled',
          }),
          payload: expect.objectContaining({
            output: {
              API_URL: 'https://google.fr',
            },
          }),
        })
      );
    });
  });

  it('Apps can listen to workspaces.apps.configured, and are executed with updated workspace/appInstance', async () => {
    const userId = 'unitTest';
    const { workspaces, broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Imports,
        userId,
      },
      false,
      {
        forceTopic: undefined,
      }
    );
    broker.start();
    runtime.start();
    const workspace = await workspaces.getWorkspace(AvailableModels.Imports);
    const appInstance = {
      appSlug: AvailableModels.BasicApp,
      config: {
        randomValue: Math.random(),
      },
    };

    const event = await broker.send<Prismeai.ConfiguredAppInstance['payload']>(
      EventType.ConfiguredApp,
      {
        appInstance,
        slug: appInstance.appSlug,
      },
      {
        workspaceId: workspace.id,
        appInstanceFullSlug: appInstance.appSlug,
      }
    );

    await waitForExpect(async () => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'onConfigured',
          }),
          payload: expect.objectContaining({
            output: {
              ...appInstance.config,
              API_URL: 'https://google.fr',
            },
          }),
        })
      );
    });
  });

  it('Apps can listen to workspaces.apps.uninstalled, and are executed with last up to date DSUL before removal', async () => {
    const userId = 'unitTest';
    const { workspaces, broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Imports,
        userId,
      },
      false,
      {
        forceTopic: undefined,
      }
    );
    broker.start();
    runtime.start();
    const workspace = await workspaces.getWorkspace(AvailableModels.Imports);

    const event = await broker.send<Prismeai.UninstalledAppInstance['payload']>(
      EventType.UninstalledApp,
      {
        slug: AvailableModels.BasicApp,
      },
      {
        workspaceId: workspace.id,
        appInstanceFullSlug: AvailableModels.BasicApp,
      }
    );

    await waitForExpect(async () => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'onUninstalled',
          }),
          payload: expect.objectContaining({
            output: {
              API_URL: 'https://google.fr',
            },
          }),
        })
      );
    });
  });

  it('When a workspace is removed, automatically triggers workspaces.apps.uninstalled automations', async () => {
    const userId = 'unitTest';
    const { workspaces, broker, runtime, sendEventSpy } = getMocks(
      {
        workspaceId: AvailableModels.Imports,
        userId,
      },
      false,
      {
        forceTopic: undefined,
      }
    );
    broker.start();
    runtime.start();
    const workspace = await workspaces.getWorkspace(AvailableModels.Imports);

    const event = await broker.send<Prismeai.DeletedWorkspace['payload']>(
      EventType.DeletedWorkspace,
      {
        workspaceId: workspace.id,
      },
      {
        workspaceId: workspace.id,
      }
    );

    await waitForExpect(async () => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            correlationId: event.source.correlationId,
            userId,
            automationSlug: 'onUninstalled',
          }),
          payload: expect.objectContaining({
            output: {
              API_URL: 'https://google.fr',
            },
          }),
        })
      );
    });
  });
});

afterAll(async () => {
  brokers.forEach((broker) => broker.close());
});
