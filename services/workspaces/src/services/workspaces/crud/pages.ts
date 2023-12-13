import { Broker } from '@prisme.ai/broker';
//@ts-ignore
import { hri } from 'human-readable-ids';
import { EventType } from '../../../eda';
import { AccessManager, ActionType, SubjectType } from '../../../permissions';
import { nanoid } from 'nanoid';
import { logger } from '../../../logger';
import { DSULType, DSULStorage } from '../../DSULStorage';
import { AppInstances } from '../..';
import { extractPageEvents } from '../../../utils/extractEvents';
import { interpolate } from '../../../utils/interpolate';

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
    // public might be set in exported pages to automatically reset public permissions on import
    { public: makePublic, ...createPage }: Prismeai.Page & { public?: boolean },
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

    const workspace = await this.storage.get({
      dsulType: DSULType.DSULIndex,
      workspaceId,
    });
    page.workspaceSlug = workspace.slug!;

    const pageMetadata = {
      name: page.name!,
      id: page.id,
      slug: page.slug,
      workspaceId,
      workspaceSlug: page.workspaceSlug,
      description: page.description,
      labels: page.labels,
      customDomains: workspace.customDomains,
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

    if (makePublic) {
      this.accessManager
        .grant(
          SubjectType.Page,
          page.id,
          {
            public: true,
          },
          {
            policies: {
              read: true,
            },
          }
        )
        .catch((err) =>
          logger.error({
            msg: 'Could not set the page public after import',
            err,
          })
        );
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
      labels: cur.labels,
      createdAt: cur.createdAt,
      createdBy: cur.createdBy,
      updatedAt: cur.updatedAt,
      updatedBy: cur.updatedBy,
      workspaceId: cur.workspaceId,
      workspaceSlug: cur.workspaceSlug,
    }));
  };

  getDetailedPage = async (
    query:
      | { workspaceId: string; slug: string }
      | { workspaceSlug: string; slug: string }
  ): Promise<Prismeai.DetailedPage> => {
    // Admin query
    if ((<any>query).workspaceId) {
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
    const workspaceSlug = (<any>query)?.workspaceSlug as string;
    // Fetch by custom domain
    let permissionsAlreadyChecked = false;
    if (workspaceSlug.includes('.')) {
      const customDomain = workspaceSlug.includes(':')
        ? workspaceSlug.slice(0, workspaceSlug.indexOf(':'))
        : workspaceSlug;
      const pageMeta = await this.accessManager.get(SubjectType.Page, {
        slug: (<any>query).slug,
        customDomains: {
          $in: [customDomain, workspaceSlug], // Check with & without port
        },
      });
      permissionsAlreadyChecked = true;
      (<any>query).workspaceSlug = pageMeta.workspaceSlug;
    }
    const page = await this.storage.get({
      ...query,
      dsulType: DSULType.DetailedPage,
    });
    if (!page.public && !permissionsAlreadyChecked) {
      await this.accessManager.get(SubjectType.Page, query);
    }

    // Delete legacy appConfig field
    page.appInstances = (page.appInstances || []).map((appInstance) => {
      delete (<any>appInstance).appConfig;
      return appInstance;
    });

    return { ...page, workspaceSlug: (<any>query).workspaceSlug };
  };

  private async getPageDetails(
    page: Prismeai.Page
  ): Promise<Prismeai.PageDetails & { blocks: Prismeai.Page['blocks'] }> {
    const workspace = await this.storage.get({
      dsulType: DSULType.DSULIndex,
      workspaceId: page.workspaceId,
    });
    const detailedAppInstances = await this.appInstances.getDetailedList(
      page.workspaceId!
    );

    const injectedBlocks = await Promise.all(
      (page.blocks || []).map(async (block) => {
        const contexts = {
          config: workspace.config?.value || {},
          appConfig: {},
        };
        const appInstance = detailedAppInstances.find((appInstance) =>
          (appInstance?.blocks || []).some(
            (appInstanceBlock) => appInstanceBlock.slug == block.slug
          )
        );
        if (appInstance) {
          const appInstanceWithConfig = await this.appInstances.getAppInstance(
            page.workspaceId!,
            appInstance.slug!
          );
          contexts.appConfig = appInstanceWithConfig.config?.value || {};
        }
        return interpolate(block, contexts, { undefinedVars: 'leave' });
      })
    );

    const filteredAppInstances = detailedAppInstances
      .map<Prismeai.PageDetails['appInstances'][0] | false>((cur) => {
        const blocks = cur.blocks.reduce((blocks, cur) => {
          if (!cur.slug) {
            return blocks;
          }
          return cur.url
            ? {
                ...blocks,
                [cur.slug]: cur.url,
              }
            : {
                ...blocks,
                [cur.slug]: cur,
              };
        }, {});
        if (!Object.keys(blocks).length) {
          return false;
        }
        return {
          slug: cur.slug,
          blocks: blocks,
        };
      }, [])
      .filter<Prismeai.PageDetails['appInstances'][0]>(Boolean as any);

    if (workspace.blocks) {
      filteredAppInstances.push({
        slug: '',
        blocks: Object.entries(workspace.blocks).reduce(
          (prev, [slug, block]) => ({
            ...prev,
            [slug]: block,
          }),
          {}
        ),
      });
    }

    return {
      appInstances: filteredAppInstances,
      blocks: injectedBlocks,
      favicon: workspace.photo,
    };
  }

  updatePage = async (
    workspaceId: string,
    slug: string,
    pageUpdate: Prismeai.Page
  ) => {
    const currentPageMeta = await this.accessManager.get(SubjectType.Page, {
      workspaceId,
      slug,
    });
    const id = currentPageMeta.id!;

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
      labels: page.labels,
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

  deletePage = async (workspaceId: string, slug: string) => {
    const page = await this.accessManager.get(SubjectType.Page, {
      workspaceId,
      slug,
    });
    const id = page.id!;

    await this.accessManager.delete(SubjectType.Page, id);

    await this.storage.delete({
      workspaceId: page.workspaceId,
      slug: page.slug,
    });

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

  updateWorkspacePagesMeta = async (
    workspaceId: string,
    newValues: Partial<Prismeai.PageMeta>,
    prevValues: Partial<Prismeai.PageMeta>
  ) => {
    const Pages = await this.accessManager.model(SubjectType.Page);
    try {
      await Pages.updateMany(
        {
          workspaceId,
        },
        {
          $set: newValues,
        }
      );

      if (prevValues.workspaceSlug && newValues.workspaceSlug) {
        await this.storage.copy(
          {
            workspaceSlug: prevValues.workspaceSlug,
            dsulType: DSULType.DetailedPage,
            parentFolder: true,
          },
          {
            workspaceSlug: newValues.workspaceSlug,
            dsulType: DSULType.DetailedPage,
            parentFolder: true,
          }
        );
        // Wait before deleting old folder to make sure new files have been propertly copied (i.e S3 eventual consistency)
        setTimeout(() => {
          this.storage
            .delete({
              workspaceSlug: prevValues.workspaceSlug,
              dsulType: DSULType.DetailedPage,
              parentFolder: true,
            })
            .catch((err) =>
              logger.warn({
                msg: 'An error occured while deleting old detailed page folder after workspace renaming',
                err,
              })
            );
        }, 2000);
      }
    } catch (err) {
      logger.warn({
        msg: 'An error occured while updating workspaces pages',
        err,
        details: {
          newValues,
          prevValues,
        },
      });
    }
  };
}

export default Pages;
