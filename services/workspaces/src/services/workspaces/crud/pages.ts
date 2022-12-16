import { Broker } from '@prisme.ai/broker';
//@ts-ignore
import { hri } from 'human-readable-ids';
import { EventType } from '../../../eda';
import {
  AccessManager,
  ActionType,
  SubjectType,
  ApiKey,
} from '../../../permissions';
import { nanoid } from 'nanoid';
import { logger } from '../../../logger';
import { DSULType, DSULStorage } from '../../DSULStorage';
import { AppInstances } from '../..';
import { RUNTIME_EMITS_BROKER_TOPIC } from '../../../../config';
import { extractPageEvents } from '../../../utils/extractEvents';

class Pages {
  private accessManager: Required<AccessManager>;
  private broker: Broker;
  private storage: DSULStorage<DSULType.Pages>;
  private appInstances: AppInstances;

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    dsulStorage: DSULStorage,
    appInstances: AppInstances
  ) {
    this.accessManager = accessManager;
    this.broker = broker;
    this.storage = dsulStorage.child(DSULType.Pages);
    this.appInstances = appInstances;
  }

  createPage = async (
    workspaceId: string,
    createPage: Prismeai.Page,
    replace: boolean = false // Force update if it already exists
  ) => {
    const page = {
      ...createPage,
    };

    if (replace) {
      if (!page.id) {
        throw new Error('Missing page.id for replace mode');
      }
    } else {
      page.id = nanoid(7);
    }
    if (!page.slug) {
      page.slug = hri.random();
    }

    if (!page.workspaceSlug) {
      const workspace = await this.storage.get({
        dsulType: DSULType.DSULIndex,
        workspaceId,
      });
      page.workspaceSlug = workspace.slug!;
    }

    const pageMetadata = {
      name: page.name!,
      id: page.id,
      slug: page.slug,
      workspaceId,
      workspaceSlug: page.workspaceSlug,
      description: page.description,
    };

    await this.accessManager.throwUnlessCan(
      ActionType.Create,
      SubjectType.Page,
      { id: page.id, workspaceId }
    );
    const events = extractPageEvents(page);

    await this.storage.save(
      {
        workspaceId,
        slug: page.slug,
      },
      page,
      {
        mode: replace ? 'replace' : 'create',
        updatedBy: this.accessManager.user?.id,
        additionalIndexFields: { events },
      }
    );
    // Legacy migration
    if (replace) {
      await this.accessManager.update(SubjectType.Page, pageMetadata);
    } else {
      await this.accessManager.create(SubjectType.Page, pageMetadata);
    }

    this.broker.send<Prismeai.CreatedPage['payload']>(
      EventType.CreatedPage,
      {
        page,
        events,
      },
      {
        workspaceId,
      }
    );
    return page;
  };

  duplicateWorkspacePages = async (
    fromWorkspaceId: string,
    toWorkspaceId: string
  ) => {
    // Without this, event would be emitted in the wrong workspace (thus failing to build detailedPages)
    this.broker = this.broker.child({
      workspaceId: toWorkspaceId,
    });

    const pages = await this.list(fromWorkspaceId);
    const pagesDsul = await Promise.all(
      pages.map((cur) =>
        this.storage
          .get({
            slug: cur.slug,
            workspaceId: cur.workspaceId,
          })
          .catch(() => undefined)
      )
    );

    // Avoid fetching same workspace on each createPage call
    const toWorkspace = await this.storage.get({
      dsulType: DSULType.DSULIndex,
      workspaceId: toWorkspaceId,
    });

    const duplicatedPages = await Promise.all(
      pagesDsul.filter(Boolean).map((cur) => {
        return this.createPage(toWorkspaceId, {
          ...cur,
          workspaceSlug: toWorkspace.slug,
          workspaceId: toWorkspaceId,
        });
      })
    );

    // Reset folderIndex as it doesn't support concurrent saves ...
    try {
      if (pagesDsul.length) {
        await this.storage.refreshFolderIndex(toWorkspaceId, DSULType.Pages);
      }
    } catch (err) {
      logger.error(err);
    }

    return duplicatedPages;
  };

  list = async (workspaceId: string): Promise<Prismeai.PageMeta[]> => {
    const pages = await this.accessManager.findAll(SubjectType.Page, {
      workspaceId,
    });
    return pages.map((cur) => ({
      id: cur.id,
      name: cur.name!,
      slug: cur.slug!,
      description: cur.description,
      createdAt: cur.createdAt,
      createdBy: cur.createdBy,
      updatedAt: cur.updatedAt,
      updatedBy: cur.updatedBy,
      workspaceId: cur.workspaceId,
      workspaceSlug: cur.workspaceSlug,
    }));
  };

  getDetailedPage = async (
    query: { id: string } | { workspaceSlug: string; slug: string }
  ): Promise<Prismeai.DetailedPage> => {
    // Admin query
    if ((<any>query).id) {
      const pageMeta = await this.accessManager.get(SubjectType.Page, query);
      const page = await this.storage.get({
        slug: pageMeta.slug,
        workspaceId: pageMeta.workspaceId,
      });
      const detailedPage = {
        ...page,
        slug: pageMeta.slug!,
        workspaceId: pageMeta.workspaceId,
        workspaceSlug: pageMeta.workspaceSlug,
        ...(await this.getPageDetails({
          ...page,
          workspaceId: pageMeta.workspaceId,
          slug: pageMeta.slug!,
          workspaceSlug: pageMeta.workspaceSlug,
        })),
        public: !!pageMeta?.permissions?.['*']?.policies?.read,
      };
      return detailedPage;
    }

    // Public query
    if (!(<any>query).workspaceSlug || !(<any>query).slug) {
      throw new Error('Missing slug or workspaceSlug');
    }
    const page = await this.storage.get({
      ...query,
      dsulType: DSULType.DetailedPage,
    });
    if (!page.public) {
      await this.accessManager.get(SubjectType.Page, query);
    }
    return { ...page, workspaceSlug: (<any>query).workspaceSlug };
  };

  private async getPageDetails(
    page: Prismeai.Page
  ): Promise<Prismeai.PageDetails> {
    const workspace = await this.storage.get({
      dsulType: DSULType.DSULIndex,
      workspaceId: page.workspaceId,
    });
    const detailedAppInstances = await this.appInstances.getDetailedList(
      page.workspaceId!
    );

    const filteredAppInstances = detailedAppInstances
      .map<Prismeai.PageDetails['appInstances'][0] | false>((cur) => {
        const blocks = cur.blocks.reduce((blocks, cur) => {
          if (!cur.slug) {
            return blocks;
          }
          return {
            ...blocks,
            [cur.slug]: cur.url,
          };
        }, {});
        if (!Object.keys(blocks).length) {
          return false;
        }
        // TODO Uncomment as soon as we've found a mean to avoid sending appConfigs to blocks
        // const blockNames = Object.keys(blocks);
        // No block page is from this appInstance : do not include it !
        // if (
        //   !(page.blocks || []).find((cur) =>
        //     blockNames.includes(cur.slug || '')
        //   )
        // ) {
        //   return false;
        // }
        return {
          slug: cur.slug,
          blocks: blocks,
        };
      }, [])
      .filter<Prismeai.PageDetails['appInstances'][0]>(Boolean as any);

    const appInstances = await Promise.all(
      filteredAppInstances.map(async (cur) => {
        const appInstance = await this.appInstances.getAppInstance(
          page.workspaceId!,
          cur.slug!
        );
        return { ...cur, config: appInstance.config?.value || {} };
      })
    );

    if (workspace.blocks) {
      appInstances.push({
        slug: '',
        config: {},
        blocks: Object.entries(workspace.blocks).reduce(
          (prev, [slug, { url = '' }]) => ({
            ...prev,
            [slug]: url,
          }),
          {}
        ),
      });
    }

    let apiKey: string = '';
    try {
      const existingDetailedPage = await this.getDetailedPage({
        workspaceSlug: page.workspaceSlug!,
        slug: page.slug!,
      });
      apiKey = existingDetailedPage.apiKey;
    } catch {}
    const pageDetails: Prismeai.PageDetails = {
      appInstances,
      apiKey,
    };
    return pageDetails;
  }

  updatePage = async (
    workspaceId: string,
    id: string,
    pageUpdate: Prismeai.Page
  ) => {
    const currentPageMeta = await this.accessManager.get(SubjectType.Page, {
      workspaceId,
      id,
    });

    const oldSlug = currentPageMeta.slug!;
    const newSlug = pageUpdate.slug || oldSlug;
    const page: Prismeai.Page = {
      ...pageUpdate,
      slug: newSlug,
      id,
      workspaceSlug: currentPageMeta.workspaceSlug,
      workspaceId,
    };

    await this.accessManager.throwUnlessCan(
      ActionType.Update,
      SubjectType.Page,
      { id, workspaceId }
    );
    const events = extractPageEvents(page);

    await this.storage.save(
      {
        workspaceId,
        slug: oldSlug,
      },
      page,
      {
        mode: 'update',
        updatedBy: this.accessManager.user?.id,
        additionalIndexFields: { events },
      }
    );
    await this.accessManager.update(SubjectType.Page, {
      id,
      name: page.name,
      description: page.description,
      slug: newSlug,
      workspaceId,
      workspaceSlug: currentPageMeta.workspaceSlug,
    });

    this.broker.send<Prismeai.UpdatedPage['payload']>(
      EventType.UpdatedPage,
      {
        page,
        slug: newSlug,
        oldSlug: newSlug !== oldSlug ? oldSlug : undefined,
        events,
      },
      { workspaceId }
    );
    return { slug: newSlug, ...page };
  };

  getUpdatedPageApiKey = async (
    page: Prismeai.DetailedPage
  ): Promise<ApiKey> => {
    const events: string[] = ['*'];
    const rules = {
      events: {
        types: events,
        filters: {
          'source.sessionId': '${user.sessionId}',
          'source.serviceTopic': RUNTIME_EMITS_BROKER_TOPIC,
        },
      },
    };
    try {
      if (page.apiKey) {
        await this.accessManager.pullApiKey(page.apiKey);
      }
    } catch {
      page.apiKey = '';
    }

    if (page.apiKey) {
      return (await this.accessManager.updateApiKey(
        page.apiKey,
        SubjectType.Workspace,
        page.workspaceId!,
        rules
      )) as ApiKey;
    }
    return (await this.accessManager.createApiKey(
      SubjectType.Workspace,
      page.workspaceId!,
      rules
    )) as ApiKey;
  };

  deletePage = async (id: string) => {
    const page = await this.accessManager.get(SubjectType.Page, id);

    await this.accessManager.delete(SubjectType.Page, id);

    await this.storage.delete({
      workspaceId: page.workspaceId,
      slug: page.slug,
    });

    // Clean the page apiKey
    try {
      const currentDetailedPage = await this.storage.get({
        workspaceSlug: page.workspaceSlug,
        slug: page.slug,
        dsulType: DSULType.DetailedPage,
      });
      const pageApiKey = currentDetailedPage?.apiKey;
      if (pageApiKey) {
        await this.accessManager.deleteApiKey(
          pageApiKey,
          SubjectType.Workspace,
          page.workspaceId!
        );
      }
    } catch {}

    // Delete the detailedPafge
    try {
      await this.storage.delete({
        workspaceSlug: page.workspaceSlug,
        slug: page.slug,
        dsulType: DSULType.DetailedPage,
      });
    } catch {}

    this.broker.send<Prismeai.DeletedPage['payload']>(
      EventType.DeletedPage,
      {
        pageSlug: page.slug!,
      },
      { workspaceId: page.workspaceId! }
    );
    return { id };
  };

  updatePagesWorkspaceSlug = async (
    workspaceId: string,
    workspaceSlug: string,
    oldWorkspaceSlug: string
  ) => {
    const Pages = await this.accessManager.model(SubjectType.Page);
    try {
      await Pages.updateMany(
        {
          workspaceId,
        },
        {
          $set: {
            workspaceSlug,
          },
        }
      );

      if (oldWorkspaceSlug) {
        await this.storage.copy(
          {
            workspaceSlug: oldWorkspaceSlug,
            dsulType: DSULType.DetailedPage,
            parentFolder: true,
          },
          {
            workspaceSlug,
            dsulType: DSULType.DetailedPage,
            parentFolder: true,
          }
        );
        await this.storage.delete({
          workspaceSlug: oldWorkspaceSlug,
          dsulType: DSULType.DetailedPage,
          parentFolder: true,
        });
      }
    } catch (err) {
      logger.warn({
        msg: 'An error occured while updating pages workspaceSlug',
        err,
      });
    }
  };
}

export default Pages;
