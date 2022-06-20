import AppInstances from './appInstances';
import '@prisme.ai/types';
import {
  AlreadyUsedError,
  MissingFieldError,
  ObjectNotFoundError,
} from '../../../errors';

jest.mock('nanoid', () => ({ nanoid: () => '123456' }));

const EMPTY_WORKSPACE_ID = '123456';
const APP_WORKSPACE_ID = 'APP_WORKPSACE_ID';
const ALREADY_INSTALLED_WORKSPACE_ID = 'ALREADY_INSTALLED_APP_WORKSPACE_ID';
const INI_AUTOMATION_SLUG = 'My automated';
const APP_ID = 'myAppId';
const APP_INSTANCE_SLUG = 'appInstanceSlug';

const workspaces = {
  [EMPTY_WORKSPACE_ID]: {
    name: 'nameWorkspace',
    id: EMPTY_WORKSPACE_ID,
  },
  [APP_WORKSPACE_ID]: {
    name: 'nameWorkspaceInitialized',
    id: APP_WORKSPACE_ID,
    automations: {
      [INI_AUTOMATION_SLUG]: {
        name: 'My automatéd: /',
        do: [],
      },
    },
  },

  [ALREADY_INSTALLED_WORKSPACE_ID]: {
    name: 'alreadyInstalledAppWorkspaceName',
    id: ALREADY_INSTALLED_WORKSPACE_ID,
    imports: {
      [APP_INSTANCE_SLUG]: {
        appSlug: APP_ID,
        version: '1',
      },
      anotherSlugThatWillConflict: {
        appSlug: APP_ID,
        version: '0',
      },
    },
    automations: {},
  },

  [EMPTY_WORKSPACE_ID]: {
    name: 'nameWorkspace',
    id: EMPTY_WORKSPACE_ID,
  },
};

const apps = {
  [APP_ID]: {
    name: 'My app name',
    workspaceId: APP_WORKSPACE_ID,
    versions: ['2', '1', '0'],
  },
};
const getMockedWorkspaces = () => ({
  getWorkspace: jest.fn((workspaceId) => workspaces[workspaceId]),
  save: jest.fn(),
});
const getMockedApps = () => ({
  getApp: jest.fn((appSlug, version?: string) => {
    if (!(appSlug in apps)) {
      throw new Error();
    }
    if (
      version &&
      version !== 'current' &&
      !(apps[appSlug].versions || []).includes(version)
    ) {
      throw new Error();
    }
    return apps[appSlug];
  }),
  exists: jest.fn((appSlug, version?: string) => {
    if (!(appSlug in apps)) {
      throw new ObjectNotFoundError();
    }
    if (
      version &&
      version !== 'current' &&
      !(apps[appSlug].versions || []).includes(version)
    ) {
      throw new ObjectNotFoundError();
    }
    return apps[appSlug];
  }),
});
const getMockedBroker = () => ({ send: jest.fn() });

describe('installApp', () => {
  it('installApp should call Workspaces crud & broker', async () => {
    const mockedWorkspaces: any = getMockedWorkspaces();
    const mockedBroker: any = getMockedBroker();
    const mockedApps: any = getMockedApps();

    const appInstancesCrud = new AppInstances(
      mockedWorkspaces,
      mockedApps,
      mockedBroker
    );

    const appInstance = {
      appSlug: APP_ID,
    };
    const result = await appInstancesCrud.installApp(EMPTY_WORKSPACE_ID, {
      ...appInstance,
      slug: APP_INSTANCE_SLUG,
    });

    expect(result).toMatchObject(appInstance);
    expect(mockedWorkspaces.save).toHaveBeenCalledWith(EMPTY_WORKSPACE_ID, {
      ...workspaces[EMPTY_WORKSPACE_ID],
      imports: { [APP_INSTANCE_SLUG]: appInstance },
    });
    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.apps.installed',
      {
        appInstance,
        slug: APP_INSTANCE_SLUG,
      },
      expect.anything()
    );
  });

  it('installApp should throw MissingFieldError if slug not defined', async () => {
    const mockedWorkspaces: any = getMockedWorkspaces();
    const mockedBroker: any = getMockedBroker();
    const mockedApps: any = getMockedApps();

    const appInstancesCrud = new AppInstances(
      mockedWorkspaces,
      mockedApps,
      mockedBroker
    );

    expect(
      appInstancesCrud.installApp(EMPTY_WORKSPACE_ID, { appSlug: '' } as any)
    ).rejects.toThrow(MissingFieldError);
  });

  it('installApp should throw AlreadyUsedError if slug already in use', async () => {
    const mockedWorkspaces: any = getMockedWorkspaces();
    const mockedBroker: any = getMockedBroker();
    const mockedApps: any = getMockedApps();

    const appInstancesCrud = new AppInstances(
      mockedWorkspaces,
      mockedApps,
      mockedBroker
    );

    expect(
      appInstancesCrud.installApp(ALREADY_INSTALLED_WORKSPACE_ID, {
        appSlug: '',
        slug: APP_INSTANCE_SLUG,
      } as any)
    ).rejects.toThrow(AlreadyUsedError);
  });

  it('installApp should throw ObjectNotFoundError if app not found', async () => {
    const mockedWorkspaces: any = getMockedWorkspaces();
    const mockedBroker: any = getMockedBroker();
    const mockedApps: any = getMockedApps();

    const appInstancesCrud = new AppInstances(
      mockedWorkspaces,
      mockedApps,
      mockedBroker
    );

    expect(
      appInstancesCrud.installApp(EMPTY_WORKSPACE_ID, {
        appSlug: 'someUnknownAppId',
        slug: APP_INSTANCE_SLUG,
      } as any)
    ).rejects.toThrow(ObjectNotFoundError);
  });

  it('installApp should throw ObjectNotFoundError if app version not found', async () => {
    const mockedWorkspaces: any = getMockedWorkspaces();
    const mockedBroker: any = getMockedBroker();
    const mockedApps: any = getMockedApps();

    const appInstancesCrud = new AppInstances(
      mockedWorkspaces,
      mockedApps,
      mockedBroker
    );

    expect(
      appInstancesCrud.installApp(EMPTY_WORKSPACE_ID, {
        appSlug: APP_ID,
        appVersion: 'someUnknownVersion',
        slug: APP_INSTANCE_SLUG,
      } as any)
    ).rejects.toThrow(ObjectNotFoundError);
  });
});

describe('configureApp', () => {
  it('configureApp should call Workspaces crud & broker', async () => {
    const mockedWorkspaces: any = getMockedWorkspaces();
    const mockedBroker: any = getMockedBroker();
    const mockedApps: any = getMockedApps();

    const appInstancesCrud = new AppInstances(
      mockedWorkspaces,
      mockedApps,
      mockedBroker
    );

    const appInstance = {
      appSlug: APP_ID,
      version: '2',
    };
    const result = await appInstancesCrud.configureApp(
      ALREADY_INSTALLED_WORKSPACE_ID,
      APP_INSTANCE_SLUG,
      appInstance
    );

    expect(result).toMatchObject(appInstance);
    expect(mockedWorkspaces.save).toHaveBeenCalledWith(
      ALREADY_INSTALLED_WORKSPACE_ID,
      {
        ...workspaces[ALREADY_INSTALLED_WORKSPACE_ID],
        imports: {
          ...workspaces[ALREADY_INSTALLED_WORKSPACE_ID].imports,
          [APP_INSTANCE_SLUG]: appInstance,
        },
      }
    );
    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.apps.configured',
      {
        appInstance: {
          ...appInstance,
          oldConfig: expect.objectContaining({}),
        },
        slug: APP_INSTANCE_SLUG,
      },
      expect.anything()
    );
  });

  it('configureApp should throw ObjectNotFound if appInstance not found', async () => {
    const mockedWorkspaces: any = getMockedWorkspaces();
    const mockedBroker: any = getMockedBroker();
    const mockedApps: any = getMockedApps();

    const appInstancesCrud = new AppInstances(
      mockedWorkspaces,
      mockedApps,
      mockedBroker
    );

    const appInstance = {
      appSlug: APP_ID,
      version: '2',
      slug: APP_INSTANCE_SLUG,
    };
    expect(
      appInstancesCrud.configureApp(
        ALREADY_INSTALLED_WORKSPACE_ID,
        'someUnknownAppInstanceSlug',
        appInstance
      )
    ).rejects.toThrow(ObjectNotFoundError);
  });

  it('configureApp should throw AlreadyUsedError if trying to rename for an already used slug', async () => {
    const mockedWorkspaces: any = getMockedWorkspaces();
    const mockedBroker: any = getMockedBroker();
    const mockedApps: any = getMockedApps();

    const appInstancesCrud = new AppInstances(
      mockedWorkspaces,
      mockedApps,
      mockedBroker
    );

    const appInstance = {
      appSlug: APP_ID,
      version: '2',
      slug: 'anotherSlugThatWillConflict',
    };
    expect(
      appInstancesCrud.configureApp(
        ALREADY_INSTALLED_WORKSPACE_ID,
        APP_INSTANCE_SLUG,
        appInstance
      )
    ).rejects.toThrow(AlreadyUsedError);
  });
});

describe('uninstallApp', () => {
  it('uninstallApp should call Workspaces crud & broker', async () => {
    const mockedWorkspaces: any = getMockedWorkspaces();
    const mockedBroker: any = getMockedBroker();
    const mockedApps: any = getMockedApps();

    const appInstancesCrud = new AppInstances(
      mockedWorkspaces,
      mockedApps,
      mockedBroker
    );

    await appInstancesCrud.uninstallApp(
      ALREADY_INSTALLED_WORKSPACE_ID,
      APP_INSTANCE_SLUG
    );

    const { [APP_INSTANCE_SLUG]: removedOne, ...importsWithoutRemovedOne } =
      workspaces[ALREADY_INSTALLED_WORKSPACE_ID].imports;

    expect(mockedWorkspaces.save).toHaveBeenCalledWith(
      ALREADY_INSTALLED_WORKSPACE_ID,
      {
        ...workspaces[ALREADY_INSTALLED_WORKSPACE_ID],
        imports: importsWithoutRemovedOne,
      }
    );

    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.apps.uninstalled',
      { appInstance: removedOne, slug: APP_INSTANCE_SLUG },
      expect.anything()
    );
  });
});
