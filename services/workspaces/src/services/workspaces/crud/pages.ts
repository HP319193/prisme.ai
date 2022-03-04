import { remove as removeDiacritics } from 'diacritics';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { AlreadyUsedError, ObjectNotFoundError } from '../../../errors';
import { AccessManager, SubjectType } from '../../../permissions';
import DSULStorage from '../../DSULStorage';

class Pages {
  private accessManager: Required<AccessManager>;
  private storage: DSULStorage;
  private broker: Broker;

  constructor(
    accessManager: Required<AccessManager>,
    storage: DSULStorage,
    broker: Broker
  ) {
    this.accessManager = accessManager;
    this.storage = storage;
    this.broker = broker;
  }

  private generatePageSlug(workspace: Prismeai.Workspace, pageName: string) {
    const base = removeDiacritics(pageName)
      .replace(/[^a-zA-Z0-9 _-]+/g, '')
      .trim()
      .slice(0, 20);
    let slug = base;
    let idx = -1;
    while (slug in (workspace.pages || {})) {
      idx++;
      slug = `${base}-${idx}`;
    }

    return slug;
  }

  private pageId(workspaceId: string, slug: string) {
    return `${workspaceId}:${slug}`;
  }

  createPage = async (workspaceId: string, page: Prismeai.Page) => {
    const workspace = await this.storage.get(workspaceId);
    const name =
      typeof page.name === 'string'
        ? page.name
        : page.name['en'] || page.name[Object.keys(page.name)[0]];
    const slug = this.generatePageSlug(workspace, name);

    const updatedWorkspace = {
      ...workspace,
      pages: {
        ...workspace.pages,
        [slug]: page,
      },
    };

    await this.accessManager.create(SubjectType.Page, {
      id: this.pageId(workspaceId, slug),
      workspaceId,
      name: slug,
    });
    await this.storage.save(workspaceId, updatedWorkspace);

    this.broker
      .send<Prismeai.CreatedPage['payload']>(EventType.CreatedPage, {
        page,
        slug,
      })
      .catch(console.error);
    return { ...page, slug };
  };

  list = async (workspaceId: string) => {
    return await this.accessManager.findAll(SubjectType.Page, {
      workspaceId,
    });
    // const workspace = await this.storage.get(workspaceId);
    // return pages.map(({ slug }) => (workspace.pages || {})[slug]);
  };

  getPage = async (workspaceId: string, pageSlug: string) => {
    await this.accessManager.get(
      SubjectType.Page,
      this.pageId(workspaceId, pageSlug)
    );
    const workspace = await this.storage.get(workspaceId);
    const page = (workspace.pages || {})[pageSlug];
    if (!page) {
      throw new ObjectNotFoundError(`Could not find page '${pageSlug}'`, {
        workspaceId,
        pageSlug,
      });
    }

    return page;
  };

  updatePage = async (
    workspaceId: string,
    pageSlug: string,
    page: Prismeai.Page
  ) => {
    await this.accessManager.update(SubjectType.Page, {
      id: this.pageId(workspaceId, pageSlug),
      workspaceId,
      name: pageSlug,
    });
    const workspace = await this.storage.get(workspaceId);

    if (!workspace || !workspace.pages || !workspace.pages[pageSlug]) {
      throw new ObjectNotFoundError(`Could not find page '${pageSlug}'`, {
        workspaceId,
        pageSlug,
      });
    }

    const updatedWorkspace = {
      ...workspace,
      pages: {
        ...workspace.pages,
        [pageSlug]: page,
      },
    };

    let oldSlug;
    if (page.slug && page.slug !== pageSlug) {
      if (page.slug in workspace.pages) {
        throw new AlreadyUsedError(
          `Page slug '${page.slug}' is already used by another page of your workspace !`
        );
      }

      oldSlug = pageSlug;
      delete updatedWorkspace.pages[oldSlug];
      updatedWorkspace.pages[page.slug] = page;

      // TODO : update slug

      // Get previous permissions,

      // Create new permission

      // Delete old permission
    }

    await this.storage.save(workspaceId, updatedWorkspace);

    this.broker.send<Prismeai.UpdatedPage['payload']>(EventType.UpdatedPage, {
      page,
      slug: page.slug || pageSlug,
      oldSlug,
    });
    return { ...page, slug: page.slug || pageSlug };
  };

  deletePage = async (
    workspaceId: string,
    pageSlug: PrismeaiAPI.DeletePage.PathParameters['pageSlug']
  ) => {
    const workspace = await this.storage.get(workspaceId);

    if (!workspace || !workspace.pages || !workspace.pages[pageSlug]) {
      throw new ObjectNotFoundError(`Could not find automation '${pageSlug}'`, {
        workspaceId,
        pageSlug,
      });
    }

    const newPages = { ...workspace.pages };
    delete newPages[pageSlug];
    const updatedWorkspace = {
      ...workspace,
      pages: newPages,
    };

    await this.accessManager.delete(
      SubjectType.Page,
      this.pageId(workspaceId, pageSlug)
    );

    await this.storage.save(workspaceId, updatedWorkspace);

    this.broker.send<Prismeai.DeletedPage['payload']>(EventType.DeletedPage, {
      page: {
        slug: pageSlug,
        name: workspace.name,
      },
    });
    return { slug: pageSlug };
  };
}

export default Pages;
