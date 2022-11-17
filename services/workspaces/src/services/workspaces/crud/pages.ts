import { Broker } from '@prisme.ai/broker';
//@ts-ignore
import { hri } from 'human-readable-ids';
import { EventType } from '../../../eda';
import { AccessManager, SubjectType } from '../../../permissions';
import { nanoid } from 'nanoid';
import { AlreadyUsedError, ObjectNotFoundError } from '../../../errors';
import { Workspaces } from '../..';
import { logger } from '../../../logger';

class Pages {
  private accessManager: Required<AccessManager>;
  private broker: Broker;
  private workspaces: Workspaces;

  constructor(
    workspaces: Workspaces,
    accessManager: Required<AccessManager>,
    broker: Broker
  ) {
    this.accessManager = accessManager;
    this.workspaces = workspaces;
    this.broker = broker;
  }

  createPage = async (
    workspaceId: string | Prismeai.Workspace,
    page: Prismeai.Page
  ) => {
    const workspace =
      typeof workspaceId === 'string'
        ? await this.workspaces.getWorkspace(workspaceId)
        : workspaceId;
    if (!page.slug) {
      page.slug = hri.random();
    } else if (
      // If workspace != 'string', it is the input DSUL that already includes given page
      typeof workspaceId === 'string' &&
      page.slug in (workspace.pages || {})
    ) {
      throw new AlreadyUsedError(
        `Your workspace already has a page with the slug '${page.slug}'`
      );
    }
    page.workspaceSlug = workspace.slug;

    // createPage should generally not be called with an id already set
    if (page.id) {
      if (
        Object.values(workspace.pages || {}).some(
          (cur) => cur.id == page.id && cur != page
        )
      ) {
        // Warning : trying to create a page with the id of another page
        throw new AlreadyUsedError(
          `Your workspace already has a page with the id '${page.id}'`
        );
      }
      page.id = undefined; // Unknown id given : force reset it
    }
    if (!page.id) {
      page.id = nanoid(7);
    }

    await this.accessManager.create(SubjectType.Page, {
      name: page.name,
      id: page.id,
      slug: page.slug,
      workspaceId: workspace.id,
      workspaceSlug: workspace.slug,
      description: page.description,
    } as Prismeai.Page);

    const slug = page.slug;
    delete page.slug;
    // Persist only if we've been given a workspaceId string, otherwise simply return the updated workspace
    if (typeof workspaceId === 'string') {
      const updatedWorkspace = {
        ...workspace,
        pages: {
          ...workspace.pages,
          [slug!]: page,
        },
      };
      await this.workspaces.save(workspaceId as string, updatedWorkspace);
    }

    this.broker.send<Prismeai.CreatedPage['payload']>(EventType.CreatedPage, {
      page,
    });
    return { slug, ...page };
  };

  list = async (workspaceId: string) => {
    const workspace = await this.workspaces.getWorkspaceAsAdmin(workspaceId);
    const pagesPerms = await this.accessManager.findAll(SubjectType.Page, {
      workspaceId,
    });
    return pagesPerms
      .filter((cur) => cur.blocks || workspace.pages?.[cur.slug!])
      .map((perms) => ({
        ...(workspace.pages?.[perms.slug!] || { ...perms, __migrate: true }),
        slug: perms.slug,
        workspaceId: perms.workspaceId,
        workspaceSlug: perms.workspaceSlug,
      })) as Prismeai.Page[];
  };

  getPage = async (
    pageId: string | Record<string, string>
  ): Promise<Prismeai.Page> => {
    const perms = await this.accessManager.get(SubjectType.Page, pageId);
    const workspace = await this.workspaces.getWorkspaceAsAdmin(
      perms.workspaceId!
    );
    const page = workspace.pages?.[perms.slug!];
    if (!page && !perms.blocks) {
      throw new ObjectNotFoundError(`Unknown page ${JSON.stringify(pageId)}`);
    }
    return {
      ...(page || { ...perms, __migrate: true }),
      slug: perms.slug,
      workspaceId: perms.workspaceId,
      workspaceSlug: perms.workspaceSlug,
    };
  };

  getDetailedPage(
    page: Prismeai.Page,
    workspace: Prismeai.Workspace,
    apps: (Prismeai.DetailedAppInstance & {
      slug: string;
    })[]
  ) {
    const getBlockDetails = (name: string) => {
      if (workspace.blocks && workspace.blocks[name]) {
        return { url: workspace.blocks[name].url };
      }
      const details = apps.reduce<{
        url: string;
        appInstance: string;
      } | null>((prev, { slug: appInstance, blocks }) => {
        if (prev) return prev;
        const found = blocks.find(
          ({ slug }) => `${appInstance}.${slug}` === name
        );
        return found
          ? {
              url: found.url || '',
              appInstance,
            }
          : null;
      }, null);
      return details || { url: '', appInstance: '' };
    };

    const blocks = [];
    if (workspace.blocks) {
      blocks.push({
        slug: '',
        appConfig: workspace.config,
        blocks: Object.entries(workspace.blocks).reduce(
          (prev, [slug, { url = '' }]) => ({
            ...prev,
            [slug]: url,
          }),
          {}
        ),
      });
    }
    const appInstances = Object.entries(workspace.imports || {}).map(
      ([slug, { config: appConfig }]) => ({
        slug,
        appConfig,
        blocks: Object.values(
          (apps.find(({ slug: s }) => slug === s) || { blocks: {} }).blocks
        ).reduce(
          (prev, { slug: name, url }) => ({
            ...prev,
            [`${slug}.${name}`]: url,
          }),
          {}
        ),
      })
    );

    const detailedPage: Prismeai.DetailedPage = {
      ...page,
      blocks: page.blocks?.map((block) => ({
        ...block,
        ...(block.name
          ? getBlockDetails(block.name)
          : { url: '', appInstance: '' }),
      })),
      appInstances: [...blocks, ...appInstances],
    };
    return detailedPage;
  }

  updatePage = async (
    workspaceId: string | Prismeai.Workspace,
    query: { id?: string; slug?: string },
    page: Prismeai.Page
  ) => {
    const workspace =
      typeof workspaceId === 'string'
        ? await this.workspaces.getWorkspace(workspaceId)
        : workspaceId;

    // Find target page
    let newSlug = page.slug;
    let currentPageDSUL: Prismeai.Page | undefined;
    if ((query as any).slug) {
      currentPageDSUL = workspace.pages?.[query?.slug!];
      if (!newSlug) {
        newSlug = query?.slug;
      }
    } else if ((query as any).id) {
      const slug = Object.keys(workspace.pages || {}).find(
        (cur) => workspace.pages?.[cur]?.id == (query as any).id
      ) as string;
      currentPageDSUL = workspace.pages?.[slug];
      if (!newSlug) {
        newSlug = slug;
      }
      if (currentPageDSUL) {
        currentPageDSUL.slug = slug;
      }
    }

    // Migration from db pages, remove someday
    if (!currentPageDSUL && (page as any).__migrate) {
      delete (page as any).__migrate;
      currentPageDSUL = page;
      if (!newSlug) {
        newSlug = hri.random();
        currentPageDSUL.slug = newSlug;
      }
    }

    if (!currentPageDSUL) {
      throw new ObjectNotFoundError(
        `Unknown page ${query.id || query.slug} in workspace ${workspaceId}`
      );
    }
    if (currentPageDSUL?.slug != newSlug) {
      delete workspace.pages?.[currentPageDSUL.slug!];
    }
    page.id = currentPageDSUL.id;

    // Check perms & update name/slug
    const existingPagePerms = await this.accessManager.get(
      SubjectType.Page,
      page.id!
    );
    if (existingPagePerms?.workspaceId != workspace.id) {
      throw new ObjectNotFoundError(
        `Warning : page id ${page.id} belongs to another workspace`
      );
    }

    await this.accessManager.update(SubjectType.Page, {
      id: page.id,
      name: page.name,
      description: page.description,
      slug: newSlug,
      workspaceId: workspace.id,
      workspaceSlug: workspace.slug,
    } as Prismeai.Page);

    delete page.slug;
    // Persist only if we've been given a workspaceId string, otherwise simply return the updated workspace
    if (typeof workspaceId === 'string') {
      const updatedPageDSUL = {
        ...currentPageDSUL,
        ...page,
      };
      delete updatedPageDSUL.slug;
      const updatedWorkspace = {
        ...workspace,
        pages: {
          ...workspace.pages,
          [newSlug!]: updatedPageDSUL,
        },
      };
      await this.workspaces.save(workspaceId as string, updatedWorkspace);
    }

    this.broker.send<Prismeai.UpdatedPage['payload']>(EventType.UpdatedPage, {
      page,
    });
    return { slug: newSlug, ...page };
  };

  deletePage = async (id: string) => {
    if (typeof id !== 'string') {
      throw new Error(
        'This should only be called from an API endpoint and not DSUL update'
      );
    }
    const page = await this.accessManager.get(SubjectType.Page, id);

    await this.accessManager.delete(SubjectType.Page, id);
    const workspace = await this.workspaces.getWorkspace(page.workspaceId!);
    delete workspace?.pages?.[page?.slug!];
    await this.workspaces.save(page.workspaceId as string, workspace);

    this.broker.send<Prismeai.DeletedPage['payload']>(EventType.DeletedPage, {
      page,
    });
    return { id };
  };

  deleteUnlinkedPages = async (workspaceId: string, knownIds: string[]) => {
    if (!workspaceId) {
      return;
    }
    const Pages = await this.accessManager.model(SubjectType.Page);
    try {
      await Pages.deleteMany({
        workspaceId,
        id: {
          $nin: knownIds,
        },
      });
    } catch (err) {
      logger.warn({
        msg: 'An error occured while deleting unlinked pages',
        err,
      });
    }
  };

  updatePagesWorkspaceSlug = async (
    workspaceId: string,
    workspaceSlug: string
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
    } catch (err) {
      logger.warn({
        msg: 'An error occured while updating pages workspaceSlug',
        err,
      });
    }
  };
}

export default Pages;
