import Broker from '@prisme.ai/broker/lib/__mocks__/broker';
import waitForExpect from 'wait-for-expect';
import { MockStorage } from '../dsulStorage/__mocks__';
import { Pages, AppInstances, Workspaces } from '.';
import { syncDetailedPagesWithEDA } from './syncDetailedPagesWithEDA';
import { DSULType } from '../dsulStorage';
import { EventType } from '../../eda';

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
  };
  accessManager.as = () => accessManager;
  return accessManager;
};

describe('Sync DetailedPages with the EDA', () => {
  let mockedAccessManager: any;
  const apps = {
    exists: jest.fn((appSlug: string, appVersion: string) => {
      return true;
    }),
    getAppDetails: jest.fn(() => {
      // Deep copy to avoid mutating blocks & skew unit tests
      return JSON.parse(
        JSON.stringify({
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
        })
      );
    }),
  };
  const dsulStorage = new MockStorage(DSULType.Pages, {});
  const dsulSaveSpy = jest.spyOn(dsulStorage, 'save');
  let broker: Broker;
  let appInstances: AppInstances;
  let pages: Pages;
  let workspaces: Workspaces;
  let pageSlug: string;

  beforeEach(async () => {
    pageSlug = `page-${Math.round(Math.random() * 1000)}`;
    mockedAccessManager = getMockedAccessManager(() => ({
      slug: pageSlug,
      workspaceId: WORKSPACE_ID,
      workspaceSlug: WORKSPACE_SLUG,
    }));
    broker = new Broker();
    appInstances = new AppInstances(
      mockedAccessManager,
      broker as any,
      dsulStorage,
      apps as any
    );
    pages = new Pages(
      mockedAccessManager,
      broker as any,
      dsulStorage,
      appInstances
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
    await syncDetailedPagesWithEDA(
      mockedAccessManager,
      broker as any,
      dsulStorage,
      pages
    );
  });

  it('Update on workspaces.pages.created and workspaces.pages.updated', async () => {
    const page = await pages.createPage(WORKSPACE_ID, {
      name: 'My page',
      slug: pageSlug,
      description: 'some description',
      workspaceSlug: WORKSPACE_SLUG,
      workspaceId: WORKSPACE_ID,
      blocks: [
        {
          slug: 'RichText',
        },
      ],
    });

    const detailedPage = await pages.getDetailedPage({
      workspaceId: WORKSPACE_ID,
      id: page.id!,
    });

    await waitForExpect(async () => {
      expect(dsulSaveSpy).toHaveBeenCalledWith(
        {
          workspaceSlug: WORKSPACE_SLUG,
          slug: page.slug!,
          dsulType: DSULType.DetailedPage,
        },
        detailedPage
      );
    });

    await pages.updatePage(WORKSPACE_ID, page.id!, {
      ...page,
      description: 'updated description',
    });
    await waitForExpect(async () => {
      expect(dsulSaveSpy).toHaveBeenCalledWith(
        {
          workspaceSlug: WORKSPACE_SLUG,
          slug: page.slug!,
          dsulType: DSULType.DetailedPage,
        },
        {
          ...detailedPage,
          description: 'updated description',
        }
      );
    });
  });

  it('Update on workspaces.blocks.updated', async () => {
    const page = await pages.createPage(WORKSPACE_ID, {
      name: 'My page',
      slug: pageSlug,
      description: 'some description',
      workspaceSlug: WORKSPACE_SLUG,
      workspaceId: WORKSPACE_ID,
      blocks: [
        {
          slug: 'Editor',
        },
      ],
    });

    await workspaces.updateWorkspace(WORKSPACE_ID, {
      name: 'name',
      blocks: {
        Editor: {
          url: 'updated url',
        },
      },
    });

    const detailedPage = await pages.getDetailedPage({
      workspaceId: WORKSPACE_ID,
      id: page.id!,
    });
    expect(
      (detailedPage.appInstances || []).find((cur) => cur.slug == '')
    ).toMatchObject(
      expect.objectContaining({
        blocks: {
          Editor: 'updated url',
        },
      })
    );

    await waitForExpect(async () => {
      expect(dsulSaveSpy).toHaveBeenCalledWith(
        {
          workspaceSlug: WORKSPACE_SLUG,
          slug: page.slug!,
          dsulType: DSULType.DetailedPage,
        },
        detailedPage
      );
    });
  });

  it('Update on workspaces.apps.configured', async () => {
    const page = await pages.createPage(WORKSPACE_ID, {
      name: 'My page',
      slug: pageSlug,
      description: 'some description',
      workspaceSlug: WORKSPACE_SLUG,
      workspaceId: WORKSPACE_ID,
      blocks: [
        {
          slug: 'Custom Code.Editor',
        },
      ],
    });

    await appInstances.installApp(WORKSPACE_ID, {
      appSlug: 'Custom Code',
      slug: 'Custom Code',
      config: {
        foo: 'bar',
      },
    });

    const detailedPage = await pages.getDetailedPage({
      workspaceId: WORKSPACE_ID,
      id: page.id!,
    });
    expect(
      (detailedPage.appInstances || []).find((cur) => cur.slug == 'Custom Code')
    ).toMatchObject(
      expect.objectContaining({
        blocks: {
          'Custom Code.Editor': 'block url',
        },
        config: {
          foo: 'bar',
        },
      })
    );

    await waitForExpect(async () => {
      expect(dsulSaveSpy).toHaveBeenCalledWith(
        {
          workspaceSlug: WORKSPACE_SLUG,
          slug: page.slug!,
          dsulType: DSULType.DetailedPage,
        },
        detailedPage
      );
    });
  });

  it('Update DetailedPage.public on public permissions change', async () => {
    const dsulPatchSpy = jest.spyOn(dsulStorage, 'patch');
    const page = await pages.createPage(WORKSPACE_ID, {
      name: 'My page',
      slug: pageSlug,
      description: 'some description',
      workspaceSlug: WORKSPACE_SLUG,
      workspaceId: WORKSPACE_ID,
      blocks: [
        {
          slug: 'Editor',
        },
      ],
    });

    await waitForExpect(async () => {
      expect(dsulSaveSpy).toHaveBeenCalledWith(
        {
          workspaceSlug: WORKSPACE_SLUG,
          slug: page.slug!,
          dsulType: DSULType.DetailedPage,
        },
        expect.objectContaining({
          public: false,
        })
      );
    });

    await broker.send<Prismeai.PagePermissionsShared['payload']>(
      EventType.PagePermissionsShared,
      {
        permissions: {
          public: true,
          policies: {
            read: true,
          },
        },
        subjectId: page.id!,
      },
      {
        workspaceId: WORKSPACE_ID,
      }
    );

    await waitForExpect(async () => {
      expect(dsulPatchSpy).toHaveBeenCalledWith(
        {
          workspaceSlug: WORKSPACE_SLUG,
          slug: page.slug!,
          dsulType: DSULType.DetailedPage,
        },
        expect.objectContaining({
          public: true,
        }),
        expect.anything()
      );

      const detailedPage = await pages.getDetailedPage({
        workspaceSlug: WORKSPACE_SLUG,
        slug: page.slug!,
      });
      expect(detailedPage.public).toBe(true);
    });

    await broker.send<Prismeai.PagePermissionsDeleted['payload']>(
      EventType.PagePermissionsDeleted,
      {
        userId: '*',
        subjectId: page.id!,
      },
      {
        workspaceId: WORKSPACE_ID,
      }
    );

    await waitForExpect(async () => {
      expect(dsulPatchSpy).toHaveBeenCalledWith(
        {
          workspaceSlug: WORKSPACE_SLUG,
          slug: page.slug!,
          dsulType: DSULType.DetailedPage,
        },
        expect.objectContaining({
          public: false,
        }),
        expect.anything()
      );

      const detailedPage = await pages.getDetailedPage({
        workspaceSlug: WORKSPACE_SLUG,
        slug: page.slug!,
      });
      expect(detailedPage.public).toBe(false);
    });
  });
});
