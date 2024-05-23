import Broker from '@prisme.ai/broker/lib/__mocks__/broker';
import waitForExpect from 'wait-for-expect';
import { MockStorage } from '../DSULStorage/__mocks__';
import { AppInstances, Workspaces } from '.';
import { DSULType } from '../DSULStorage';
import { EventType } from '../../eda';

jest.mock(
  '../apps/crud/apps',
  () =>
    function () {
      this.exists = () => true;
      this.getApp = () => ({
        config: {},
      });
    }
);
import { initWorkspacesConfigSyncing } from './syncWorkspacesWithConfigContexts';

const USER_ID = 'myUserId';
const WORKSPACE_ID = 'workspaceId';
const WORKSPACE_SLUG = 'workspaceSlug';
jest.mock('nanoid', () => ({ nanoid: () => WORKSPACE_ID }));

const getMockedAccessManager = (get?: any) => {
  const accessManager: any = {
    user: {
      id: USER_ID,
    },
    throwUnlessCan: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    get: jest.fn(get || (() => ({}))),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findRoles: jest.fn(() => []),
    saveRole: jest.fn(() => new Promise((resolve) => resolve(null))),
  };
  accessManager.as = () => accessManager;
  return accessManager;
};

describe('Sync workspaces config with the EDA', () => {
  let mockedAccessManager: any;
  const apps = {
    getApp: jest.fn(() => ({
      config: {},
    })),
    exists: jest.fn((appSlug: string, appVersion: string) => {
      return true;
    }),
  };
  const dsulStorage = new MockStorage(DSULType.Pages, {});
  let broker: Broker;
  let appInstances: AppInstances;
  let workspaces: Workspaces;

  beforeEach(async () => {
    mockedAccessManager = getMockedAccessManager();
    broker = new Broker();
    appInstances = new AppInstances(
      mockedAccessManager,
      broker as any,
      dsulStorage,
      apps as any
    );
    workspaces = new Workspaces(
      mockedAccessManager,
      broker as any,
      dsulStorage
    );
    await workspaces.createWorkspace({
      name: 'Test workspace',
      slug: WORKSPACE_SLUG,
      blocks: {
        RichText: {
          url: 'richTextUrl',
        },
      },
    });

    broker.start();
    await initWorkspacesConfigSyncing(
      mockedAccessManager,
      broker as any,
      dsulStorage
    );
  });

  it('Update workspace config', async () => {
    const directUpdate = await workspaces.updateWorkspace(WORKSPACE_ID, {
      config: {
        value: {
          foo: `${Math.round(Math.random() * 1000)}`,
        },
      },
    } as any);

    await broker.send<Prismeai.UpdatedContexts['payload']>(
      EventType.UpdatedContexts,
      {
        updates: [
          {
            type: 'merge',
            path: 'this.is.nested',
            value: {
              un: 1,
              deux: 2,
            },
            fullPath: 'config.this.is.nested',
            context: 'config',
          },
        ],
      },
      {
        workspaceId: WORKSPACE_ID,
      }
    );

    await waitForExpect(async () => {
      const workspace = await workspaces.getWorkspace(WORKSPACE_ID);
      expect(workspace).toMatchObject(
        expect.objectContaining({
          config: expect.objectContaining({
            value: {
              ...directUpdate?.config?.value,
              this: {
                is: {
                  nested: {
                    un: 1,
                    deux: 2,
                  },
                },
              },
            },
          }),
        })
      );
    });
  });

  it('Update appInstances config', async () => {
    const appInstance = await appInstances.installApp(WORKSPACE_ID, {
      slug: 'NLU',
      appSlug: 'NLU',
      config: {
        intents: {
          hello: {
            phrases: ['salut'],
          },
        },
      },
    } as any);

    await broker.send<Prismeai.UpdatedContexts['payload']>(
      EventType.UpdatedContexts,
      {
        updates: [
          {
            type: 'push',
            path: 'intents.hello.phrases',
            value: 'hello',
            fullPath: 'config.intents.hello.phrases',
            context: 'config',
          },
          {
            type: 'merge',
            path: 'NLU',
            value: {
              botId: '...',
            },
            fullPath: 'NLU',
            context: 'config',
          },
        ],
      },
      {
        workspaceId: WORKSPACE_ID,
        appInstanceFullSlug: 'NLU',
      }
    );

    await waitForExpect(async () => {
      const updatedAppInstance = await appInstances.getAppInstance(
        WORKSPACE_ID,
        'NLU'
      );

      expect({
        ...updatedAppInstance,
        config: updatedAppInstance.config?.value,
      }).toMatchObject(
        expect.objectContaining({
          config: expect.objectContaining({
            ...appInstance.config,
            intents: {
              hello: {
                phrases: [...appInstance.config.intents.hello.phrases, 'hello'],
              },
            },
            NLU: {
              botId: '...',
            },
          }),
        })
      );
    });
  });
});
