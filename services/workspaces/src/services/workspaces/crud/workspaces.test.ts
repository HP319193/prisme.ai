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
    imports: [
      {
        slug: 'unchangedAppInstance',
        appId: 'someAppId',
      },
      {
        slug: 'willBeChangedAppInstance',
        appId: 'someAppId',
      },
      // {
      //   slug: 'willBeRemovedAppInstance',
      //   appId: 'someAppId',
      // },
    ],
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
const getMockedBroker = () => ({ send: jest.fn() });

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

  const unchangedAppInstance = workspaces[INIT_WORKSPACE_ID].imports[0];
  const updatedAppInstance = {
    ...workspaces[INIT_WORKSPACE_ID].imports[1],
    name: 'renamedAppInstance',
  };
  const createdAppInstance = {
    appId: 'someAppId',
    slug: 'newAppInstanceSlug',
  };
  const removedAppInstance = workspaces[INIT_WORKSPACE_ID].imports[2];
  const workspace: Prismeai.Workspace = {
    ...workspaces[INIT_WORKSPACE_ID],
    imports: [unchangedAppInstance, updatedAppInstance, createdAppInstance],
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
    'workspaces.app.configured',
    updatedAppInstance
  );

  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.app.installed',
    createdAppInstance
  );

  // expect(mockedBroker.send).toHaveBeenCalledWith(
  //   'workspaces.app.uninstalled',
  //   removedAppInstance
  // );

  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.automation.updated',
    {
      automation: workspace.automations[INIT_AUTOMATION_SLUG],
      slug: INIT_AUTOMATION_SLUG,
    }
  );

  expect(mockedBroker.send).toHaveBeenCalledWith(
    'workspaces.automation.deleted',
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
    'workspaces.automation.created',
    {
      automation: workspace.automations[ADDED_AUTOMATION_SLUG],
      slug: ADDED_AUTOMATION_SLUG,
    }
  );

  expect(mockedBroker.send).toHaveBeenCalledTimes(6);
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
