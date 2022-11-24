import AppInstances from './appInstances';
import Pages from './pages';
import '@prisme.ai/types';
import { ActionType, SubjectType } from '../../../permissions';
import { DSULType } from '../../dsulStorage';
import { MockStorage } from '../../dsulStorage/__mocks__';

const USER_ID = '9999';
const WORKSPACE_ID = '123456';
const WORKSPACE_SLUG = 'myWorkspaceSlug';
const PAGE_SLUG = 'myPage';
jest.mock('nanoid', () => ({ nanoid: () => WORKSPACE_ID }));

const getMockedAccessManager = (get?: any) => ({
  user: {
    id: USER_ID,
  },
  throwUnlessCan: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  get: jest.fn(() => ({
    slug: PAGE_SLUG,
    workspaceId: WORKSPACE_ID,
    workspaceSlug: WORKSPACE_SLUG,
  })),
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
  const dsulStorage = new MockStorage(DSULType.Pages);
  let mockedBroker: any;
  let appInstancesCrud: AppInstances;
  let pagesCrud: Pages;
  const dsulSaveSpy = jest.spyOn(dsulStorage, 'save');
  const dsulDeleteSpy = jest.spyOn(dsulStorage, 'delete');
  const apps = {
    exists: jest.fn((appSlug: string, appVersion: string) => {
      return true;
    }),
  };
  let pageId;

  beforeEach(() => {
    mockedBroker = getMockedBroker();
    appInstancesCrud = new AppInstances(
      mockedAccessManager,
      mockedBroker,
      dsulStorage,
      apps as any
    );
    pagesCrud = new Pages(
      mockedAccessManager,
      mockedBroker,
      dsulStorage,
      appInstancesCrud
    );
  });

  it('createPage', async () => {
    const slug = PAGE_SLUG;
    const page: Prismeai.Page & { slug: string } = {
      slug: PAGE_SLUG,
      workspaceId: WORKSPACE_ID,
      workspaceSlug: WORKSPACE_SLUG,
      blocks: [],
    };
    const result = await pagesCrud.createPage(WORKSPACE_ID, page);
    pageId = result.id;

    expect(result).toEqual({ ...page, id: expect.any(String) });
    expect(mockedAccessManager.throwUnlessCan).toHaveBeenCalledWith(
      ActionType.Create,
      SubjectType.Page,
      { workspaceId: WORKSPACE_ID, id: pageId }
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
      'workspaces.pages.created',
      {
        page: result,
      },
      {
        workspaceId: WORKSPACE_ID,
      }
    );
  });

  it('updatePage', async () => {
    const oldSlug = PAGE_SLUG;
    const newSlug = PAGE_SLUG + 'Updated';
    const page: Prismeai.Page & { slug: string } = {
      slug: newSlug,
      workspaceId: WORKSPACE_ID,
      workspaceSlug: WORKSPACE_SLUG,
      blocks: [
        {
          slug: 'Custom Code.Editor',
        },
      ],
    };

    const result = await pagesCrud.updatePage(WORKSPACE_ID, pageId, page);

    expect(result).toEqual({ ...page, id: pageId });
    expect(mockedAccessManager.throwUnlessCan).toHaveBeenCalledWith(
      ActionType.Update,
      SubjectType.Page,
      { workspaceId: WORKSPACE_ID, id: pageId }
    );
    expect(dsulSaveSpy).toHaveBeenCalledWith(
      { workspaceId: WORKSPACE_ID, slug: result.slug },
      result,
      {
        mode: 'update',
        updatedBy: USER_ID,
      }
    );
    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.pages.updated',
      {
        page: result,
        slug: result.slug,
        oldSlug,
      },
      {
        workspaceId: WORKSPACE_ID,
      }
    );

    mockedAccessManager.get = jest.fn(() => ({
      slug: result.slug,
      workspaceId: WORKSPACE_ID,
      workspaceSlug: WORKSPACE_SLUG,
    }));
  });

  it('deletePage', async () => {
    const slug = PAGE_SLUG + 'Updated';

    await pagesCrud.deletePage(pageId);

    expect(mockedAccessManager.delete).toHaveBeenCalledWith(
      SubjectType.Page,
      pageId
    );
    expect(dsulDeleteSpy).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      slug,
    });
    expect(dsulDeleteSpy).toHaveBeenCalledWith({
      workspaceSlug: WORKSPACE_SLUG,
      slug,
      dsulType: DSULType.DetailedPage,
    });
    expect(mockedBroker.send).toHaveBeenCalledWith(
      'workspaces.pages.deleted',
      {
        pageSlug: slug,
      },
      {
        workspaceId: WORKSPACE_ID,
      }
    );
  });
});

describe('Detailed pages', () => {
  const mockedAccessManager: any = getMockedAccessManager();
  const dsulStorage = new MockStorage(
    DSULType.Pages,
    {},
    {
      [`workspaces/${WORKSPACE_ID}/versions/current/index.yml`]: `
      blocks:
        myBlock:
          url: 'myBlockURL'`,
    }
  );
  let mockedBroker: any;
  let appInstancesCrud: AppInstances;
  let pagesCrud: Pages;
  const appDetails: Prismeai.AppDetails = {
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
      emit: [
        {
          event: 'executed',
          autocomplete: {},
        },
      ],
      listen: ['request'],
    },
  };

  const apps = {
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
    await appInstancesCrud.installApp(WORKSPACE_ID, {
      appSlug: 'Custom Code',
      slug: 'Custom Code',
      config: {
        functions: {
          foo: {
            code: 'return "hello world";',
          },
        },
      },
    });
    await appInstancesCrud.installApp(WORKSPACE_ID, {
      appSlug: 'Dialog Box',
      slug: 'Dialog Box',
    });
    pagesCrud = new Pages(
      mockedAccessManager,
      mockedBroker,
      dsulStorage,
      appInstancesCrud
    );
  });

  it('getDetailedPage', async () => {
    const page = await pagesCrud.createPage(WORKSPACE_ID, {
      slug: PAGE_SLUG,
      workspaceId: WORKSPACE_ID,
      workspaceSlug: WORKSPACE_SLUG,
      blocks: [
        {
          slug: 'Custom Code.Editor',
        },
      ],
    });

    const detailedPage = await pagesCrud.getDetailedPage({
      id: page.id!,
    });
    expect(detailedPage).toEqual({
      ...page,
      appInstances: [
        {
          slug: 'Custom Code',
          blocks: {
            'Custom Code.Editor': 'block url',
          },
          config: {
            functions: {
              foo: {
                code: 'return "hello world";',
              },
            },
          },
        },
        {
          blocks: {
            myBlock: 'myBlockURL',
          },
          slug: '',
          config: {},
        },
      ],
      public: false,
    });
  });
});
