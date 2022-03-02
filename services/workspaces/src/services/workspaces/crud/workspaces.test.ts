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

const getMockedStorage = () => ({ save: jest.fn(), delete: jest.fn() });
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
