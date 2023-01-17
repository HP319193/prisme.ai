import AppInstances from './appInstances';
import '@prisme.ai/types';
import { ActionType, SubjectType } from '../../../permissions';
import { DSULType } from '../../DSULStorage';
import { MockStorage } from '../../DSULStorage/__mocks__';
import { AppDetails } from '../../apps/crud/apps';

const USER_ID = '9999';
const WORKSPACE_ID = '123456';
const APP_SLUG = 'Custom Code';
const APP_INSTANCE_SLUG = 'myCode';
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

const getMockedBroker = () => ({
  send: jest.fn(),
  buffer: jest.fn(),
  flush: jest.fn(),
  clear: jest.fn(),
});

describe('Basic ops should call accessManager, DSULStorage, broker & Apps', () => {
  const mockedAccessManager: any = getMockedAccessManager();
  const dsulStorage = new MockStorage(DSULType.Imports);
  let mockedBroker: any;
  let appInstancesCrud: AppInstances;
  const dsulSaveSpy = jest.spyOn(dsulStorage, 'save');
  const dsulDeleteSpy = jest.spyOn(dsulStorage, 'delete');
  const apps = {
    getApp: jest.fn(() => ({
      config: {},
    })),
    exists: jest.fn((appSlug: string, appVersion: string) => {
      return true;
    }),
  };

  beforeEach(() => {
    mockedBroker = getMockedBroker();
    appInstancesCrud = new AppInstances(
      mockedAccessManager,
      mockedBroker,
      dsulStorage,
      apps as any
    );
  });

  it('installApp', async () => {
    const slug = APP_INSTANCE_SLUG;
    const appInstance: Prismeai.AppInstance & { slug: string } = {
      appSlug: APP_SLUG,
      slug: APP_INSTANCE_SLUG,
    };
    const events = {
      emit: [],
      listen: [],
    };
    const result = await appInstancesCrud.installApp(WORKSPACE_ID, appInstance);

    expect(result).toEqual(appInstance);
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
        additionalIndexFields: {
          events,
        },
      }
    );
    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.apps.installed',
      {
        appInstance,
        slug,
        events,
      },
      {
        appSlug: appInstance.appSlug,
        appInstanceFullSlug: slug,
        workspaceId: WORKSPACE_ID,
      }
    );
    expect(apps.exists).toHaveBeenCalledWith(
      appInstance.appSlug,
      appInstance.appVersion
    );

    const { documentation, ...getResult } =
      await appInstancesCrud.getAppInstance(WORKSPACE_ID, slug);
    expect(getResult).toEqual({ ...result, config: { value: {} } });
  });

  it('configureApp', async () => {
    const oldSlug = APP_INSTANCE_SLUG;
    const newSlug = APP_INSTANCE_SLUG + 'Updated';
    const appInstance: Prismeai.AppInstance & { slug: string } = {
      appSlug: APP_SLUG,
      slug: newSlug,
      appVersion: 'someVersion',
      config: {
        foo: 'bar',
      },
    };
    const events = {
      emit: [],
      listen: [],
    };
    const result = await appInstancesCrud.configureApp(
      WORKSPACE_ID,
      oldSlug,
      appInstance
    );

    expect(result).toEqual({
      ...appInstance,
      config: { value: appInstance?.config },
    });
    expect(mockedAccessManager.throwUnlessCan).toHaveBeenCalledWith(
      ActionType.Update,
      SubjectType.Workspace,
      WORKSPACE_ID
    );
    expect(dsulSaveSpy).toHaveBeenCalledWith(
      { workspaceId: WORKSPACE_ID, slug: newSlug },
      appInstance,
      {
        mode: 'update',
        updatedBy: USER_ID,
        additionalIndexFields: { events },
      }
    );
    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.apps.configured',
      {
        appInstance: {
          ...appInstance,
          oldConfig: {},
        },
        slug: newSlug,
        oldSlug,
        events,
      },
      {
        appSlug: appInstance.appSlug,
        appInstanceFullSlug: newSlug,
        workspaceId: WORKSPACE_ID,
      }
    );
    expect(apps.exists).toHaveBeenCalledWith(
      appInstance.appSlug,
      appInstance.appVersion
    );
  });

  it('uninstallApp', async () => {
    const slug = APP_INSTANCE_SLUG + 'Updated';
    await appInstancesCrud.uninstallApp(WORKSPACE_ID, slug);

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
      'workspaces.apps.uninstalled',
      {
        slug,
      },
      {
        appSlug: APP_SLUG,
        appInstanceFullSlug: slug,
        workspaceId: WORKSPACE_ID,
      }
    );
  });
});

describe('Detailed appInstances', () => {
  const mockedAccessManager: any = getMockedAccessManager();
  const dsulStorage = new MockStorage(DSULType.Imports);
  let mockedBroker: any;
  let appInstancesCrud: AppInstances;
  const appDetails: AppDetails = {
    photo: 'somePhotoUrl',
    config: {
      schema: {
        API_URL: {
          type: 'string',
        },
      },
    },
    automations: [
      {
        name: 'Initializer',
        slug: 'init',
        arguments: {
          text: {
            type: 'string',
          },
        },
      },
    ],
    blocks: [
      {
        slug: 'Editor',
        url: 'block url',
      },
    ],
    events: {
      listen: ['request'],
      autocomplete: [
        {
          event: '{{event}}',
          autocomplete: {
            event: {
              template: 'intents.detected.${value}',
              from: 'appConfig',
              path: 'intents[*]~',
            },
          },
        },
      ],
    },
  };

  const apps = {
    getApp: jest.fn(() => ({
      config: {},
    })),
    exists: jest.fn(() => true),
    getAppDetails: jest.fn(() => {
      // Deep copy to avoid mutating blocks & skew unit tests
      return JSON.parse(JSON.stringify(appDetails));
    }),
  };

  beforeAll(async () => {
    mockedBroker = getMockedBroker();
    appInstancesCrud = new AppInstances(
      mockedAccessManager,
      mockedBroker,
      dsulStorage,
      apps as any
    );

    const appInstance: Prismeai.AppInstance & { slug: string } = {
      appSlug: APP_SLUG,
      slug: APP_INSTANCE_SLUG,
      config: {
        intents: {
          welcome: {
            phrases: 'bonjour',
          },
          goodbye: {
            phrases: 'aurevoir',
          },
        },
      },
    };
    return await appInstancesCrud.installApp(WORKSPACE_ID, appInstance);
  });

  it('list : list workspace appInstances', async () => {
    const appInstances = await appInstancesCrud.list(WORKSPACE_ID);
    expect(appInstances).toEqual([
      {
        appSlug: APP_SLUG,
        createdAt: expect.any(String),
        createdBy: USER_ID,
        updatedAt: expect.any(String),
        updatedBy: USER_ID,
        slug: APP_INSTANCE_SLUG,
        events: {
          emit: [
            `${APP_INSTANCE_SLUG}.intents.detected.welcome`,
            `${APP_INSTANCE_SLUG}.intents.detected.goodbye`,
          ],
          listen: ['request'],
        },
      },
    ]);
  });

  it('getDetailedList', async () => {
    const {
      config: _,
      documentation: ____,
      ...appInstance
    } = await appInstancesCrud.getAppInstance(WORKSPACE_ID, APP_INSTANCE_SLUG);
    const detailedList = await appInstancesCrud.getDetailedList(WORKSPACE_ID);
    const { config: __, blocks, ...remainingAppDetails } = appDetails;

    expect(detailedList).toEqual([
      {
        ...appInstance,
        ...remainingAppDetails,
        blocks: blocks.map((block) => {
          if (block?.slug) {
            block.slug = `${appInstance.slug}.${block.slug}`;
          }
          return block;
        }),
        slug: APP_INSTANCE_SLUG,
        createdAt: expect.any(String),
        createdBy: USER_ID,
        updatedAt: expect.any(String),
        updatedBy: USER_ID,
        events: {
          listen: appDetails?.events?.listen,
          emit: [
            `${APP_INSTANCE_SLUG}.intents.detected.welcome`,
            `${APP_INSTANCE_SLUG}.intents.detected.goodbye`,
          ],
        },
      },
    ]);
  });
});
