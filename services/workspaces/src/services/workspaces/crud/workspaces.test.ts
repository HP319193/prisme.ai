import Workspaces from './workspaces';
import '@prisme.ai/types';
import { SubjectType } from '../../../permissions';

jest.mock('nanoid', () => ({ nanoid: () => '123456' }));

const getMockedAccessManager = () => ({
  create: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const getMockedApps = () => ({
  getApp: jest.fn(),
});

const INIT_WORKSPACE_ID = 'initWorkspaceId';
const INIT_AUTOMATION_SLUG = 'initAutomationSlug';
const workspaces = {
  [INIT_WORKSPACE_ID]: {
    id: INIT_WORKSPACE_ID,
    name: 'initWorkspace',
    imports: {
      unchangedAppInstance: {
        appSlug: 'someAppId',
      },
      willBeChangedAppInstance: {
        appSlug: 'someAppId',
        appVersion: 'current',
      },
      willBeRemovedAppInstance: {
        appSlug: 'someAppId',
      },
    },
    automations: {
      [INIT_AUTOMATION_SLUG]: {
        name: 'willBeChangedAutomation',
        do: [],
      },
      someUnchangedAutomation: {
        name: 'someUnchangedAutomation',
        do: [],
      },
      willBeRemovedAutomation: {
        name: 'willBeRemovedAutomation',
        do: [],
      },
    },
  },
};
const getMockedStorage = () => ({
  save: jest.fn(),
  delete: jest.fn(),
  get: jest.fn((workspaceId: string) => {
    if (workspaceId in workspaces) {
      return workspaces[workspaceId];
    }
    return {};
  }),
});
const getMockedBroker = () => ({
  send: jest.fn(),
  buffer: jest.fn(),
  flush: jest.fn(),
  clear: jest.fn(),
});

it('createWorkspace should call accessManager, DSULStorage, broker', async () => {
  const workspace: Prismeai.Workspace = {
    name: 'nameWorkspace',
    id: '123456',
  };
  const mockedAccessManager: any = getMockedAccessManager();
  const mockedApps: any = getMockedApps();
  const mockedStorage: any = getMockedStorage();
  const mockedBroker: any = getMockedBroker();
  const workspaceCrud = new Workspaces(
    mockedAccessManager,
    mockedApps,
    mockedBroker,
    mockedStorage
  );

  const result = await workspaceCrud.createWorkspace(workspace);

  expect(result).toBe(workspace);
  expect(mockedAccessManager.create).toHaveBeenCalledWith(
    SubjectType.Workspace,
    { id: workspace.id, name: workspace.name }
  );
  expect(mockedStorage.save).toHaveBeenCalledWith('123456', workspace);
  expect(mockedBroker.send).toHaveBeenCalledWith('workspaces.created', {
    workspace,
  });
});

it('updateWorkspace should call accessManager, DSULStorage, broker', async () => {
  const workspace: Prismeai.Workspace = {
    name: 'nameWorkspace',
    id: '123456',
  };
  const mockedAccessManager: any = getMockedAccessManager();
  const mockedApps: any = getMockedApps();
  const mockedStorage: any = getMockedStorage();
  const mockedBroker: any = getMockedBroker();
  const workspaceCrud = new Workspaces(
    mockedAccessManager,
    mockedApps,
    mockedBroker,
    mockedStorage
  );

  const result = await workspaceCrud.updateWorkspace(workspace.id, workspace);

  expect(result).toBe(workspace);
  expect(mockedAccessManager.update).toHaveBeenCalledWith(
    SubjectType.Workspace,
    { id: workspace.id, name: workspace.name }
  );
  expect(mockedStorage.save).toHaveBeenCalledWith('123456', workspace);
  expect(mockedBroker.send).toHaveBeenCalledWith('workspaces.updated', {
    workspace,
  });
});

it('updateWorkspace should emit specific events corresponding to each updated part', async () => {
  const ADDED_AUTOMATION_SLUG = 'addedAutomationSlug';

  let {
    unchangedAppInstance,
    willBeChangedAppInstance,
    willBeRemovedAppInstance,
  } = workspaces[INIT_WORKSPACE_ID].imports;
  const createdAppInstance = {
    appSlug: 'someAppId',
  };
  willBeChangedAppInstance = {
    ...willBeChangedAppInstance,
    appVersion: 'someNewVersion',
  };
  const workspace: Prismeai.Workspace = {
    ...workspaces[INIT_WORKSPACE_ID],
    imports: {
      unchangedAppInstance,
      willBeChangedAppInstance,
      createdAppInstance,
    },
    automations: {
      [INIT_AUTOMATION_SLUG]: {
        name: 'defaultAutomationNameRenamed',
        do: [],
      },
      [ADDED_AUTOMATION_SLUG]: {
        name: 'addedAutomationName',
        do: [],
      },
      someUnchangedAutomation:
        workspaces[INIT_WORKSPACE_ID].automations.someUnchangedAutomation,
    },
  };
  const mockedAccessManager: any = getMockedAccessManager();
  const mockedApps: any = getMockedApps();
  const mockedStorage: any = getMockedStorage();
  const mockedBroker: any = getMockedBroker();
  const workspaceCrud = new Workspaces(
    mockedAccessManager,
    mockedApps,
    mockedBroker,
    mockedStorage
  );

  await workspaceCrud.updateWorkspace(workspace.id, workspace);

  expect(mockedBroker.send).toHaveBeenCalledWith('workspaces.updated', {
    workspace,
  });

  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.apps.configured',
    {
      appInstance: willBeChangedAppInstance,
      slug: 'willBeChangedAppInstance',
      oldSlug: undefined,
    },
    expect.anything()
  );

  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.apps.installed',
    {
      appInstance: createdAppInstance,
      slug: 'createdAppInstance',
    },
    expect.anything()
  );

  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.apps.uninstalled',
    {
      appInstance: willBeRemovedAppInstance,
      slug: 'willBeRemovedAppInstance',
    },
    expect.anything()
  );

  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.automations.updated',
    {
      automation: workspace.automations[INIT_AUTOMATION_SLUG],
      slug: INIT_AUTOMATION_SLUG,
    }
  );

  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.automations.deleted',
    {
      automation: {
        name: workspaces[INIT_WORKSPACE_ID].automations[
          'willBeRemovedAutomation'
        ].name,
        slug: 'willBeRemovedAutomation',
      },
    }
  );

  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.automations.created',
    {
      automation: workspace.automations[ADDED_AUTOMATION_SLUG],
      slug: ADDED_AUTOMATION_SLUG,
    }
  );

  expect(mockedBroker.send).toHaveBeenCalledTimes(7);
});

it('save should call accessManager & DSULStorage', async () => {
  const workspace: Prismeai.Workspace = {
    name: 'nameWorkspace',
    id: '123456',
  };
  const mockedAccessManager: any = getMockedAccessManager();
  const mockedApps: any = getMockedApps();
  const mockedStorage: any = getMockedStorage();
  const mockedBroker: any = getMockedBroker();
  const workspaceCrud = new Workspaces(
    mockedAccessManager,
    mockedApps,
    mockedBroker,
    mockedStorage
  );

  await workspaceCrud.save(workspace.id, workspace);

  expect(mockedAccessManager.update).toHaveBeenCalledWith(
    SubjectType.Workspace,
    { id: workspace.id, name: workspace.name }
  );
  expect(mockedStorage.save).toHaveBeenCalledWith('123456', workspace);
});

it('deleteWorkspace should call accessManager, DSULStorage, broker', async () => {
  const workspace: Prismeai.Workspace = {
    name: 'nameWorkspace',
    id: '123456',
  };
  const mockedAccessManager: any = getMockedAccessManager();
  const mockedApps: any = getMockedApps();
  const mockedStorage: any = getMockedStorage();
  const mockedBroker: any = getMockedBroker();
  const workspaceCrud = new Workspaces(
    mockedAccessManager,
    mockedApps,
    mockedBroker,
    mockedStorage
  );

  await workspaceCrud.deleteWorkspace(workspace.id);

  expect(mockedAccessManager.delete).toHaveBeenCalledWith(
    SubjectType.Workspace,
    workspace.id
  );
  expect(mockedStorage.delete).toHaveBeenCalledWith(workspace.id);
  expect(mockedBroker.send).toHaveBeenCalledWith('workspaces.deleted', {
    workspaceId: workspace.id,
  });
});
