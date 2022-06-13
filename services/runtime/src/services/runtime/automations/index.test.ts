import waitForExpect from 'wait-for-expect';
import { Broker } from '@prisme.ai/broker/lib/__mocks__';
import { Workspaces, Workspace } from '../../workspaces';
import { DriverType } from '../../../storage/types';
import { FilesystemOptions } from '../../../storage/drivers/filesystem';
import path from 'path';
import { Apps } from '../../apps';
import Cache from '../../../cache/__mocks__/cache';
import { AvailableModels } from '../../workspaces/__mocks__/workspaces';
import { EventType } from '../../../eda';
import Runtime from '..';
import { RUNTIME_EMITS_BROKER_TOPIC } from '../../../../config';
import { EventSource } from '@prisme.ai/broker';

global.console.warn = jest.fn();

let brokers = [];

const getMocks = (partialSource?: Partial<EventSource>, opts?: any) => {
  const parentBroker = new Broker();
  const broker = parentBroker.child(
    {
      workspaceId: AvailableModels.Instructions,
      userId: 'unitTests',
      ...partialSource,
    },
    {
      validateEvents: false,
      ...opts,
    }
  );

  const emitBroker = broker.child(
    {},
    {
      forceTopic: RUNTIME_EMITS_BROKER_TOPIC,
      validateEvents: false,
    }
  );

  const modelsStorage: FilesystemOptions = {
    dirpath: path.join(__dirname, '../../workspaces/__mocks__/'),
  };

  const apps = new Apps(DriverType.FILESYSTEM, modelsStorage);
  const workspaces = new Workspaces(
    DriverType.FILESYSTEM,
    modelsStorage,
    apps,
    broker as any
  );

  const runtime = new Runtime(broker as any, workspaces, new Cache());
  broker.start();
  runtime.start();
  brokers.push(broker);

  return {
    broker,
    emitBroker,
    runtime,
    workspaces,
    sendEventSpy: jest.spyOn(broker, '_send'),
    execute: async (automationSlug: string, payload: any) => {
      const correlationId = `${Date.now()}`;
      const childBroker = broker.child({
        correlationId,
      });
      const output = await runtime.processEvent(
        {
          type: EventType.TriggeredWebhook,
          source: {
            workspaceId: AvailableModels.Instructions,
            correlationId,
            userId: 'unitTests',
          },
          payload: {
            workspaceId: AvailableModels.Instructions,
            automationSlug,
            body: payload,
          },
        } as Prismeai.PrismeEvent,
        console as any,
        childBroker as any
      );
      return output[0].output;
    },
  };
};

describe('Variables & Contexts', () => {
  it('Set a session.value variable', async () => {
    const { execute } = getMocks();

    const payload = {
      field: 'session.value',
      value: Math.random(),
    };
    const { session } = await execute('mySet', payload);

    expect(session).toMatchObject({ value: payload.value });
  });

  it('Set a session.value variable & calls a next automation using this new variable', async () => {
    const { execute } = getMocks();

    const payload = {
      field: 'session.value',
      value: Math.random(),
    };
    const { session } = await execute('setAndNoop', payload);

    expect(session).toMatchObject({ value: payload.value });
  });

  it('Local set is not visible in next automation', async () => {
    const { execute } = getMocks();

    const payload = {
      field: 'local',
      value: Math.random(),
    };
    const { field } = await execute('setAndNoop', payload);

    expect(field).toEqual(undefined);
  });

  it('Call an automation setting user.myBro & check that current automation can read it afterwards', async () => {
    const { execute } = getMocks();

    const output = await execute('readUserVarSetByChildAutomation', {});

    expect(output).toEqual('bruh');
  });

  it('Set run.variable, emit an event & check that triggered automation can read this run.variable', async () => {
    const { execute, sendEventSpy } = getMocks();

    const payload = {
      field: 'run.variable',
      value: Math.random(),
    };
    await execute('setAndEmitNoop', payload);

    await waitForExpect(async () => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            automationSlug: 'noop',
          }),
          payload: expect.objectContaining({
            output: expect.objectContaining({
              run: expect.objectContaining({
                automationSlug: 'noop',
                variable: payload.value,
              }),
            }),
          }),
        })
      );
    });
  });

  it('Set config.foo should emit runtime.contexts.updated ', async () => {
    const { execute, sendEventSpy } = getMocks();

    await execute('setConfig', {});

    await waitForExpect(async () => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.UpdatedContexts,
          payload: expect.objectContaining({
            contexts: {
              config: {
                foo: 'bar',
                petite: 'maison',
                password: 'REDACTED',
              },
            },
          }),
        })
      );
    });
  });

  it('Set user.id allow switching between user / session contexts ', async () => {
    const { execute, sendEventSpy } = getMocks();

    // Our contexts are initially empty
    const initial = await execute('noop', {});
    expect(initial.user).toEqual({ id: 'unitTests' });
    expect(initial.session).toEqual({});

    // Fill them
    await execute('mySet', {
      field: 'user.name',
      value: 'Martin',
    });
    const afterSets = await execute('mySet', {
      field: 'session.age',
      value: '24',
    });
    expect(afterSets.user).toMatchObject({ name: 'Martin' });
    expect(afterSets.session).toMatchObject({ age: '24' });

    // Switch to a new empty user
    const afterUserSwitching = await execute('mySet', {
      field: 'user.id',
      value: 'someRandomId',
    });
    expect(afterUserSwitching.user).toEqual({ id: 'someRandomId' });
    expect(afterUserSwitching.session).toEqual({});

    // Get back to our first user
    const getBack = await execute('mySet', {
      field: 'user.id',
      value: 'unitTests',
    });
    expect(getBack.user).toEqual(afterSets.user);
    expect(getBack.session).toEqual(afterSets.session);
  });

  it('Set a session.value variable then delete it', async () => {
    const { execute } = getMocks();

    const payload = {
      field: 'session.value',
      value: Math.random(),
    };
    const afterSet = await execute('mySet', payload);
    expect(afterSet.session).toEqual({ value: payload.value });

    const afterDelete = await execute('myDelete', { field: 'session.value' });
    expect(afterDelete.session).toEqual({});
  });

  it('Run context should always reflect current automation / appInstance', async () => {
    const { execute } = getMocks();

    const output = await execute('testRunContext', {});
    expect(output).toEqual([
      expect.objectContaining({
        automationSlug: 'testRunContext',
        appSlug: undefined,
        appInstanceSlug: undefined,
        appInstanceFullSlug: undefined,
        parentAppSlug: undefined,
      }),
      expect.objectContaining({
        automationSlug: 'testRunContext',
        appSlug: 'basicApp',
        appInstanceSlug: 'basicApp',
        appInstanceFullSlug: 'basicApp',
        parentAppSlug: undefined,
      }),
      expect.objectContaining({
        automationSlug: 'testRunContext',
        appSlug: 'nestedApp',
        appInstanceSlug: 'nestedApp',
        appInstanceFullSlug: 'basicApp.nestedApp',
        parentAppSlug: 'basicApp',
      }),
      expect.objectContaining({
        automationSlug: 'testRunContext',
        appSlug: 'nestedApp',
        appInstanceSlug: 'nestedApp',
        appInstanceFullSlug: 'basicApp.nestedApp',
        parentAppSlug: 'basicApp',
      }),
    ]);
  });
});

describe('Logic', () => {
  it('Simple repeat', async () => {
    const { execute } = getMocks();

    const obj = await execute('transformListToObject', {});
    expect(obj).toEqual({
      un: true,
      deux: true,
      trois: true,
      quatre: true,
    });
  });

  it('Simple repeat with until', async () => {
    const { execute } = getMocks();

    const obj = await execute('simpleRepeatUntil', {});
    expect(obj).toEqual([0, 1, 2, 3]);
  });

  it('Simple repeat with on and until', async () => {
    const { execute } = getMocks();

    const obj = await execute('simpleRepeatOnAndUntil', {});
    expect(obj).toEqual(['un', 'deux']);
  });

  it('Repeat with condition inside', async () => {
    const { execute } = getMocks();

    const obj = await execute('conditionallyTransformListToObject', {});
    expect(obj).toEqual({
      un: true,
      deux: true,
      'trois blouh': true,
      quatre: true,
    });
  });

  it('Simple conditions', async () => {
    const { execute } = getMocks();

    await expect(execute('conditionalOutput', { age: 90 })).resolves.toEqual(
      'Papi !'
    );
    await expect(execute('conditionalOutput', { age: 6 })).resolves.toEqual(
      'Marmot !'
    );
    await expect(execute('conditionalOutput', { age: 40 })).resolves.toEqual(
      "Toujours dans la force de l'age !"
    );
  });

  it('Simple wait', async () => {
    const { execute, emitBroker, sendEventSpy } = getMocks();

    const waitPromise = execute('simpleWait', {
      event: 'noop',
    });

    // Sleep 100ms
    await new Promise((resolve) => setTimeout(resolve, 100));
    const event = await emitBroker.send('noop', {
      foo: 'bar',
    });

    const output = await waitPromise;
    expect(output).toEqual({
      foo: 'bar',
    });

    // Usual automations should also be triggered
    await waitForExpect(async () => {
      expect(sendEventSpy).toBeCalledWith(
        expect.objectContaining({
          type: EventType.ExecutedAutomation,
          source: expect.objectContaining({
            automationSlug: 'noop',
            correlationId: event.source.correlationId,
          }),
          payload: expect.objectContaining({
            output: expect.objectContaining({
              run: expect.objectContaining({
                automationSlug: 'noop',
              }),
            }),
          }),
        })
      );
    });
  });

  it('Wait with filters', async () => {
    const { execute, emitBroker } = getMocks();

    const waitPromise = execute('simpleWait', {
      event: 'myEvent',
      filters: {
        'payload.foo': 'baz',
      },
    });

    // Sleep 100ms
    await new Promise((resolve) => setTimeout(resolve, 100));
    await emitBroker.send('myEvent', {
      foo: 'bar',
    });
    await emitBroker.send('myEvent', {
      foo: 'baz',
    });

    const output = await waitPromise;
    expect(output).toEqual({
      foo: 'baz',
    });
  });

  it('Wait with cancelTriggers: true', async () => {
    const { execute, emitBroker, sendEventSpy } = getMocks();

    const waitPromise = execute('simpleWait', {
      event: 'noop',
      cancelTriggers: true,
    });

    // Sleep 100ms
    await new Promise((resolve) => setTimeout(resolve, 100));
    const event = await emitBroker.send('noop', {
      foo: 'bar',
    });

    const output = await waitPromise;
    expect(output).toEqual({
      foo: 'bar',
    });

    // Usual automations should not be triggered
    expect(sendEventSpy).not.toBeCalledWith(
      expect.objectContaining({
        type: EventType.ExecutedAutomation,
        source: expect.objectContaining({
          automationSlug: 'noop',
          correlationId: event.source.correlationId,
        }),
        payload: expect.objectContaining({
          output: expect.objectContaining({
            run: expect.objectContaining({
              automationSlug: 'noop',
            }),
          }),
        }),
      })
    );
  });

  it('Simple break', async () => {
    const { execute, emitBroker } = getMocks();

    const output = await execute('simpleBreak', {});

    expect(output).toEqual('beforeBreak');
  });

  it('Default break only breaks current automation', async () => {
    const { execute, emitBroker } = getMocks();

    const output = await execute('breakFromChildAutomation', {});

    expect(output).toEqual('afterBreak');
  });

  it('Break with scope: all breaks all automations', async () => {
    const { execute, emitBroker } = getMocks();

    const output = await execute('breakFromChildAutomation', { scope: 'all' });

    expect(output).toEqual('beforeBreak');
  });
});

it('Arguments with secret: true are removed from native events', async () => {
  const { execute, sendEventSpy } = getMocks();

  await execute('secretArguments', { token: 'mySecretToken' });

  await waitForExpect(async () => {
    expect(sendEventSpy).toBeCalledWith(
      expect.objectContaining({
        type: EventType.ExecutedAutomation,
        payload: expect.objectContaining({
          payload: {
            body: expect.objectContaining({
              token: 'REDACTED',
            }),
          },
          output: 'REDACTED',
        }),
      })
    );
  });
});

it('Arguments with secret: true remain redacted in native events from child automation calls', async () => {
  const { execute, sendEventSpy } = getMocks();

  await execute('secretArguments', { token: 'mySecretToken' });

  await waitForExpect(async () => {
    expect(sendEventSpy).toBeCalledWith(
      expect.objectContaining({
        type: EventType.ExecutedAutomation,
        payload: expect.objectContaining({
          slug: 'secretArgumentsBis',
          payload: {
            data: expect.objectContaining({
              token: 'REDACTED',
            }),
            hello: 'world',
          },
          output: {
            token: 'REDACTED',
            hello: 'world',
            password: 'REDACTED',
          },
        }),
      })
    );
  });
});

afterAll(async () => {
  brokers.forEach((broker) => broker.close());
});
