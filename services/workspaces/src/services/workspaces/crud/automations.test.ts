import Automations from './automations';
import '@prisme.ai/types';
import { ActionType, SubjectType } from '../../../permissions';
import { IStorage, DriverType } from '../../../storage/types';
import DSULStorage, { DSULType, getPath } from '../../DSULStorage';
import { AlreadyUsedError, ObjectNotFoundError } from '../../../errors';

const USER_ID = '9999';
const WORKSPACE_ID = '123456';
jest.mock('nanoid', () => ({ nanoid: () => WORKSPACE_ID }));

const getMockedAccessManager = () => ({
  user: {
    id: USER_ID,
  },
  throwUnlessCan: jest.fn(),
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
      throw new ObjectNotFoundError();
    }),
  };

  return new DSULStorage(driver, DSULType.Automations);
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
  let automationsCrud: Automations;
  const dsulSaveSpy = jest.spyOn(dsulStorage, 'save');
  const dsulDeleteSpy = jest.spyOn(dsulStorage, 'delete');

  beforeEach(() => {
    mockedBroker = getMockedBroker();
    automationsCrud = new Automations(
      mockedAccessManager,
      mockedBroker,
      dsulStorage
    );
  });

  it('createAutomation', async () => {
    const slug = 'autom';
    const automation: Prismeai.Automation = {
      name: 'doSomething',
      do: [],
      slug,
    };
    const result = await automationsCrud.createAutomation(
      WORKSPACE_ID,
      automation
    );

    expect(result).toEqual(automation);
    expect(mockedAccessManager.throwUnlessCan).toHaveBeenCalledWith(
      ActionType.Update,
      SubjectType.Workspace,
      WORKSPACE_ID
    );
    expect(dsulSaveSpy).toHaveBeenCalledWith(
      { workspaceId: WORKSPACE_ID, slug },
      result,
      {
        mode: 'create',
        updatedBy: USER_ID,
      }
    );
    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.automations.created',
      {
        automation,
        slug,
      }
    );
  });

  it('createAutomation throws AlreadyUsedError', async () => {
    const slug = 'autom';
    const automation: Prismeai.Automation = {
      name: 'doSomething',
      do: [],
      slug,
    };
    await expect(
      automationsCrud.createAutomation(WORKSPACE_ID, automation)
    ).rejects.toThrowError(AlreadyUsedError);
  });

  it('updateAutomation', async () => {
    const oldSlug = 'autom';
    const newSlug = 'newSlug';
    const lastDSUL = await automationsCrud.getAutomation(WORKSPACE_ID, oldSlug);
    const automation: Prismeai.Automation = {
      ...lastDSUL,
      description: 'Some description',
      slug: newSlug,
    };
    const result = await automationsCrud.updateAutomation(
      WORKSPACE_ID,
      oldSlug,
      automation
    );

    expect(result).toEqual(automation);
    expect(mockedAccessManager.throwUnlessCan).toHaveBeenCalledWith(
      ActionType.Update,
      SubjectType.Workspace,
      WORKSPACE_ID
    );
    expect(dsulSaveSpy).toHaveBeenCalledWith(
      { workspaceId: WORKSPACE_ID, slug: newSlug },
      result,
      {
        mode: 'update',
        updatedBy: USER_ID,
      }
    );
    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.automations.updated',
      {
        automation,
        slug: newSlug,
        oldSlug,
      }
    );
  });

  it('deleteAutomation', async () => {
    const slug = 'newSlug';
    await automationsCrud.deleteAutomation(WORKSPACE_ID, slug);

    expect(mockedAccessManager.throwUnlessCan).toHaveBeenCalledWith(
      ActionType.Update,
      SubjectType.Workspace,
      WORKSPACE_ID
    );
    expect(dsulDeleteSpy).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      slug,
    });
    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.automations.deleted',
      {
        automationSlug: slug,
      }
    );
  });
});
