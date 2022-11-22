import Workspaces from './workspaces';
import '@prisme.ai/types';
import { SubjectType } from '../../../permissions';
import { IStorage, DriverType } from '../../../storage/types';
import DSULStorage, { DSULType, getPath } from '../../DSULStorage';

const DEFAULT_ID = '123456';
jest.mock('nanoid', () => ({ nanoid: () => DEFAULT_ID }));

const getMockedAccessManager = () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
});

const getMockedStorage = (): DSULStorage => {
  const store = {};
  const driver: IStorage = {
    type: () => DriverType.FILESYSTEM,
    find: () => Promise.resolve([]),
    save: jest.fn((id: string, data: any) => {
      store[id] = data;
      return Promise.resolve(true);
    }),
    copy: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    get: jest.fn((id: string) => {
      if (id in store) {
        return store[id];
      }
      return {};
    }),
  };

  return new DSULStorage(driver, DSULType.DSULIndex);
};
const getMockedBroker = () => ({
  send: jest.fn(),
  buffer: jest.fn(),
  flush: jest.fn(),
  clear: jest.fn(),
});

describe('Basic ops should call accessManager, DSULStorage, broker', () => {
  const mockedAccessManager: any = getMockedAccessManager();
  const dsulStorage = getMockedStorage();
  let mockedBroker: any;
  let workspaceCrud: Workspaces;
  const dsulSaveSpy = jest.spyOn(dsulStorage, 'save');

  beforeEach(() => {
    mockedBroker = getMockedBroker();
    workspaceCrud = new Workspaces(
      mockedAccessManager,
      mockedBroker,
      dsulStorage
    );
  });

  it('createWorkspace', async () => {
    const workspace: Prismeai.Workspace = {
      name: 'nameWorkspace',
    };
    const result = await workspaceCrud.createWorkspace(workspace);

    expect(result).toEqual(
      expect.objectContaining({
        ...workspace,
        id: DEFAULT_ID,
        slug: expect.any(String),
      })
    );
    expect(mockedAccessManager.create).toHaveBeenCalledWith(
      SubjectType.Workspace,
      expect.objectContaining({ id: result.id, name: workspace.name })
    );
    expect(dsulSaveSpy).toHaveBeenCalledWith(
      { workspaceId: result.id },
      result
    );
    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.created',
      {
        workspace: result,
      },
      {
        workspaceId: result.id,
      }
    );
  });

  it('updateWorkspace', async () => {
    const workspace: Prismeai.Workspace = {
      name: 'nameWorkspace',
      description: 'some description',
      id: DEFAULT_ID,
    };

    const lastDSUL = await workspaceCrud.getWorkspace(workspace.id!);
    expect(lastDSUL).toMatchObject({
      id: DEFAULT_ID,
      slug: expect.any(String),
      name: expect.any(String),
    });

    const result = await workspaceCrud.updateWorkspace(
      workspace.id!,
      workspace
    );

    expect(result).toEqual({ ...workspace, slug: lastDSUL.slug });
    expect(mockedAccessManager.update).toHaveBeenCalledWith(
      SubjectType.Workspace,
      expect.objectContaining({ id: workspace.id, name: workspace.name })
    );
    expect(dsulSaveSpy).toHaveBeenCalledWith(
      { workspaceId: result.id },
      result
    );
    expect(mockedBroker.send).toHaveBeenCalledWith('workspaces.updated', {
      workspace: result,
    });
  });

  it('updateWorkspace should emit specific events corresponding to each updated part', async () => {
    const lastDSUL = await workspaceCrud.getWorkspace(DEFAULT_ID);
    const workspace: Prismeai.Workspace = {
      id: DEFAULT_ID,
      name: 'someUpdatedName',
      slug: 'someUpdatedSlug',
      blocks: {
        myBlock: {
          name: 'blockName',
        },
      },
      config: {
        value: {
          foo: 'bar',
        },
      },
    };

    workspaceCrud.pages.updatePagesWorkspaceSlug = jest.fn();

    const result = await workspaceCrud.updateWorkspace(
      workspace.id!,
      workspace
    );

    expect(mockedBroker.send).toHaveBeenCalledWith('workspaces.updated', {
      workspace: result,
      oldSlug: lastDSUL.slug,
    });
    expect(workspaceCrud.pages.updatePagesWorkspaceSlug).toHaveBeenCalledWith(
      workspace.id!,
      workspace.slug,
      lastDSUL.slug
    );
    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.blocks.updated',
      {
        blocks: result.blocks,
        workspaceSlug: result.slug,
      }
    );
    expect(mockedBroker.send).toHaveBeenCalledWith('workspaces.configured', {
      config: result.config,
    });

    expect(mockedBroker.send).toHaveBeenCalledTimes(3);
  });

  it('deleteWorkspace', async () => {
    const lastDSUL = await workspaceCrud.getWorkspace(DEFAULT_ID);
    const dsulDeleteSpy = jest.spyOn(dsulStorage, 'delete');
    await workspaceCrud.deleteWorkspace(DEFAULT_ID);

    expect(mockedAccessManager.delete).toHaveBeenCalledWith(
      SubjectType.Workspace,
      DEFAULT_ID
    );
    expect(dsulDeleteSpy).toHaveBeenCalledWith({
      workspaceId: DEFAULT_ID,
      parentFolder: true,
    });

    // Also delete pages
    expect(mockedAccessManager.deleteMany).toHaveBeenCalledWith(
      SubjectType.Page,
      { workspaceId: DEFAULT_ID }
    );

    expect(mockedBroker.send).toHaveBeenCalledWith('workspaces.deleted', {
      workspaceId: DEFAULT_ID!,
      workspaceSlug: lastDSUL.slug,
    });
  });
});
