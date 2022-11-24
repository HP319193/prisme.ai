import waitForExpect from 'wait-for-expect';
import { Broker } from '@prisme.ai/broker/lib/__mocks__';
import { Workspaces, Workspace } from './workspaces';
import { DriverType } from '../../storage/types';
import { FilesystemOptions } from '../../storage/drivers/filesystem';
import path from 'path';
import { Apps } from '../apps';
import { AvailableModels } from '../workspaces/__mocks__/workspaces';
import { EventType } from '../../eda';

jest.setTimeout(5000);
global.console.warn = jest.fn();

let brokers: Broker[] = [];

const buildTriggers = (
  automation: Prismeai.Automation,
  workspace: Workspace,
  type: 'endpoint' | 'event'
) => {
  return [
    automation?.when?.endpoint &&
      type === 'endpoint' && {
        type: 'endpoint',
        value: automation?.when?.endpoint,
        automationSlug: automation.name,
        workspace,
      },

    automation?.when?.events?.length &&
      type === 'event' && {
        type: 'event',
        value: automation?.when?.events[0],
        automationSlug: automation.name,
        workspace,
      },
  ].filter(Boolean);
};

const buildAutomation = (name = 'myNewAutomation') => {
  return {
    name,
    when: {
      events: [`run.${name}`],
      endpoint: `customEndpointOf${name}`,
    },
    output: 'someOutput',
    do: [
      {
        set: {
          name: 'session.randomId',
          value: `${Math.random() * 1000}`,
        },
      },
    ],
  };
};

const getMocks = () => {
  const broker = new Broker();

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

  broker.start();
  brokers.push(broker);
  workspaces.startLiveUpdates();
  return {
    broker,
    workspaces,
    sendEventSpy: jest.spyOn(broker, '_send'),
  };
};

it('Simple workspace loading', async () => {
  const { workspaces } = getMocks();
  expect(
    workspaces.fetchWorkspace(AvailableModels.Basic)
  ).resolves.toMatchObject(
    expect.objectContaining({
      name: AvailableModels.Basic,
      automations: expect.objectContaining({
        empty: expect.objectContaining({
          when: {
            events: ['run.empty'],
            endpoint: true,
          },
        }),
      }),
    })
  );

  const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
  expect(workspace).toBeInstanceOf(Workspace);
  expect(workspace.name).toEqual(AvailableModels.Basic);
  expect(workspace.getAutomation('empty')).toMatchObject(
    expect.objectContaining(workspace.dsul.automations?.empty)
  );
  expect(
    workspace.getEventTriggers({ type: 'run.empty', source: {} } as any)
  ).toMatchObject(
    buildTriggers(workspace.dsul.automations?.empty!, workspace, 'event')
  );
});

it('Workspaces are kept up to date with workspaces.configured events', async () => {
  const { workspaces, broker } = getMocks();
  const workspace = await workspaces.getWorkspace(AvailableModels.Basic);

  const foo = 'bar' + Math.round(Math.random() * 1000);
  await broker.send<Prismeai.ConfiguredWorkspace['payload']>(
    EventType.ConfiguredWorkspace,
    {
      config: {
        value: {
          foo,
        },
      },
    },
    {
      workspaceId: workspace.id,
    }
  );

  await waitForExpect(async () => {
    const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
    expect(workspace.dsul.config?.value?.foo).toEqual(foo);
  });
});

// Uncomment when the 5000ms setTimeout is removed from DeletedWorkspace handler
// it('Workspaces are kept up to date with workspaces.deleted events', async () => {
//   const { workspaces, broker } = getMocks();
//   const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
//   expect(workspace).toBeTruthy();

//   (workspaces as any).fetchWorkspace = jest.fn(() => {
//     throw new ObjectNotFoundError('App not found');
//   });
//   console.log('MOCKED');
//   await broker.send<Prismeai.DeletedWorkspace['payload']>(
//     EventType.DeletedWorkspace,
//     {
//       workspaceId: workspace.id,
//     },
//     {
//       workspaceId: workspace.id,
//     }
//   );

//   await waitForExpect(async () => {
//     const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
//     expect(workspace).toBeFalsy();
//   });
// });

it('Workspaces are kept up to date with workspaces.automations.created events', async () => {
  const { workspaces, broker } = getMocks();
  const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
  expect(workspace.dsul.automations?.myNewAutomation).toBeUndefined();
  const myNewAutomation = {
    name: 'myNewAutomation',
    when: {
      events: ['run.myNewAutomation'],
      endpoint: 'customEndpoint',
    },
    output: 'someOutput',
    do: [
      {
        set: {
          name: 'session.randomId',
          value: `${Math.random() * 1000}`,
        },
      },
    ],
  };

  await broker.send<Prismeai.CreatedAutomation['payload']>(
    EventType.CreatedAutomation,
    {
      automation: myNewAutomation,
      slug: 'myNewAutomation',
    },
    {
      workspaceId: workspace.id,
    }
  );

  await waitForExpect(async () => {
    const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
    expect(workspace.getAutomation('myNewAutomation')).toMatchObject(
      expect.objectContaining(myNewAutomation)
    );
    expect(
      workspace.getEndpointTriggers(myNewAutomation?.when?.endpoint)
    ).toMatchObject(buildTriggers(myNewAutomation, workspace, 'endpoint'));
    expect(
      workspace.getEventTriggers({
        type: myNewAutomation?.when?.events[0],
        source: {},
      } as any)
    ).toMatchObject(buildTriggers(myNewAutomation, workspace, 'event'));
  });
});

it('Workspaces are kept up to date with workspaces.automations.updated events', async () => {
  const { workspaces, broker } = getMocks();
  const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
  expect(workspace.dsul.automations?.empty).not.toBeFalsy();
  const empty = {
    ...workspace.dsul.automations?.empty,
    do: [
      {
        emit: {
          event: 'empty has been run',
        },
      },
    ],
    when: {
      ...workspace.dsul.automations?.empty.when,
      endpoint: 'MyCustomEmptyEndpoint',
    },
  };

  await broker.send<Prismeai.UpdatedAutomation['payload']>(
    EventType.UpdatedAutomation,
    {
      automation: empty as any,
      slug: 'empty',
    },
    {
      workspaceId: workspace.id,
    }
  );

  await waitForExpect(async () => {
    const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
    expect(workspace.getAutomation('empty')).toMatchObject(
      expect.objectContaining(empty)
    );
    expect(workspace.getEndpointTriggers(empty?.when?.endpoint)).toMatchObject(
      buildTriggers(empty as any, workspace, 'endpoint')
    );
  });
});

it('Workspaces are kept up to date with workspaces.automations.deleted events', async () => {
  const { workspaces, broker } = getMocks();
  const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
  expect(workspace.dsul.automations?.empty).not.toBeFalsy();

  await broker.send<Prismeai.DeletedAutomation['payload']>(
    EventType.DeletedAutomation,
    {
      automationSlug: 'empty',
    },
    {
      workspaceId: workspace.id,
    }
  );

  await waitForExpect(async () => {
    const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
    expect(workspace.getAutomation('empty')).toBeNull();
    expect(
      workspace.getEventTriggers({ type: 'run.empty', source: {} } as any)
        .length
    ).toEqual(0);
  });
});

it('Workspaces are kept up to date with workspaces.apps.installed events', async () => {
  const { workspaces, broker } = getMocks();
  const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
  expect(workspace.getAutomation('basicApp.basicEmpty')).toBeNull();
  const appInstance = {
    appSlug: AvailableModels.BasicApp,
  };

  await broker.send<Prismeai.InstalledAppInstance['payload']>(
    EventType.InstalledApp,
    {
      appInstance,
      slug: appInstance.appSlug,
    },
    {
      workspaceId: workspace.id,
    }
  );

  await waitForExpect(async () => {
    const workspace = await workspaces.getWorkspace(AvailableModels.Basic);
    expect(workspace.getAutomation('basicApp.basicEmpty')).not.toBeFalsy();
    expect(
      workspace.getEventTriggers({
        type: 'basicApp.triggerEmpty',
        source: {},
      } as any).length
    ).toEqual(1);
    expect(workspace.imports[appInstance.appSlug]).not.toBeFalsy();
  });
});

it('Workspaces are kept up to date with workspaces.apps.configured events', async () => {
  const { workspaces, broker } = getMocks();
  const workspace = await workspaces.getWorkspace(AvailableModels.Imports);
  expect(workspace.getAutomation('basicApp.basicEmpty')).not.toBeFalsy();
  const appInstance = {
    appSlug: AvailableModels.BasicApp,
    config: {
      someConfig: 'someValue',
    },
  };

  await broker.send<Prismeai.ConfiguredAppInstance['payload']>(
    EventType.ConfiguredApp,
    {
      appInstance: appInstance as any,
      slug: appInstance.appSlug,
    },
    {
      workspaceId: workspace.id,
    }
  );

  await waitForExpect(async () => {
    const workspace = await workspaces.getWorkspace(AvailableModels.Imports);
    expect(workspace.getAutomation('basicApp.basicEmpty')).not.toBeFalsy();
    expect(
      workspace.getEventTriggers({
        type: 'basicApp.triggerEmpty',
        source: {},
      } as any).length
    ).toEqual(1);
    expect(workspace.imports[appInstance.appSlug]).not.toBeFalsy();
    expect(workspace.imports[appInstance.appSlug].config).toMatchObject({
      API_URL: 'https://google.fr',
      ...appInstance.config,
    });
  });
});

it('Workspaces are kept up to date with workspaces.apps.uninstalled events', async () => {
  const { workspaces, broker } = getMocks();
  const workspace = await workspaces.getWorkspace(AvailableModels.Imports);
  expect(workspace.getAutomation('basicApp.basicEmpty')).not.toBeFalsy();

  const appInstance = {
    appSlug: AvailableModels.BasicApp,
  };
  await broker.send<Prismeai.UninstalledAppInstance['payload']>(
    EventType.UninstalledApp,
    {
      slug: appInstance.appSlug,
    },
    {
      workspaceId: workspace.id,
    }
  );

  await waitForExpect(async () => {
    const workspace = await workspaces.getWorkspace(AvailableModels.Imports);
    expect(workspace.getAutomation('basicApp.basicEmpty')).toBeFalsy();
    // expect(
    //   workspace.getEventTriggers({
    //     type: 'basicApp.triggerEmpty',
    //     source: {},
    //   } as any).length
    // ).toEqual(0);
    // expect(workspace.imports[appInstance.appSlug]).toBeFalsy();
  });
});

it('Workspace appInstances are kept up to date with apps.published events', async () => {
  const { workspaces, broker } = getMocks();
  const workspace = await workspaces.getWorkspace(AvailableModels.Imports);

  expect(workspace.imports[AvailableModels.BasicApp].config).toEqual({
    API_URL: 'https://google.fr',
  });
  const app = {
    ...workspace.imports[AvailableModels.BasicApp].dsul,
    config: {
      value: {
        defaultConfigValue: Math.random(),
      },
    },
  };

  const realGetApp = (workspaces as any).apps.getApp.bind(
    (workspaces as any).apps
  );
  (workspaces as any).apps.getApp = jest.fn((appSlug) => {
    if (appSlug === AvailableModels.BasicApp) {
      return app;
    }
    return realGetApp(appSlug);
  });

  await broker.send<Prismeai.PublishedApp['payload']>(
    EventType.PublishedApp,
    {
      app: {
        slug: AvailableModels.BasicApp,
      } as any,
    },
    {
      workspaceId: workspace.id,
    }
  );

  await waitForExpect(async () => {
    const workspace = await workspaces.getWorkspace(AvailableModels.Imports);
    expect(workspace.imports[AvailableModels.BasicApp].config).toEqual(
      app.config.value
    );
  });
});

it('Nested appInstances are kept up to date with apps.published events', async () => {
  const { workspaces, broker } = getMocks();
  const workspace = await workspaces.getWorkspace(AvailableModels.Imports);

  expect(
    workspace.imports['preconfigured'].imports['nestedApp'].config
  ).toMatchObject({
    preconfigured: 'variable',
    API_URL: 'https://google.fr',
    nestedApp: 'someValue',
  });

  const app = {
    ...workspace.imports['preconfigured'].imports[AvailableModels.NestedApp]
      .dsul,
    config: {
      value: {
        nestedApp: 'someUpdatedValue',
      },
    },
  };

  const realGetApp = (workspaces as any).apps.getApp.bind(
    (workspaces as any).apps
  );
  (workspaces as any).apps.getApp = jest.fn((appSlug) => {
    if (appSlug === AvailableModels.NestedApp) {
      return app;
    }
    return realGetApp(appSlug);
  });

  await broker.send<Prismeai.PublishedApp['payload']>(
    EventType.PublishedApp,
    {
      app: {
        slug: AvailableModels.NestedApp,
      } as any,
    },
    {
      workspaceId: AvailableModels.NestedApp,
    }
  );

  await waitForExpect(async () => {
    const workspace = await workspaces.getWorkspace(AvailableModels.Imports);
    expect(
      workspace.imports['preconfigured'].imports['nestedApp'].config
    ).toMatchObject({
      preconfigured: 'variable',
      API_URL: 'https://google.fr',
      ...app.config.value,
    });
  });
});

afterAll(async () => {
  brokers.forEach((broker) => broker.close());
});
