import { remove as removeDiacritics } from 'diacritics';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import Workspaces from './workspaces';
import DSULStorage from '../../DSULStorage';
import { AlreadyUsedError, ObjectNotFoundError } from '../../../errors';
import { AccessManager, SubjectType } from '../../../permissions';

class Pages {
  private accessManager: Required<AccessManager>;
  private broker: Broker;
  private storage: DSULStorage;
  private workspaces: Workspaces;

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    storage: DSULStorage,
    workspaces: Workspaces
  ) {
    this.accessManager = accessManager;
    this.broker = broker;
    this.storage = storage;
    this.workspaces = workspaces;
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

  createPage = async (workspaceId: string, page: Prismeai.Page) => {
    const workspace = await this.workspaces.getWorkspace(workspaceId);
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
      id: `${workspace.id}:${slug}`,
      workspaceId: workspace.id!,
      name: slug,
    });
    await this.workspaces.updateWorkspace(workspaceId, updatedWorkspace);

    this.broker
      .send<Prismeai.CreatedPage['payload']>(EventType.CreatedPage, {
        page,
        slug,
      })
      .catch(console.error);
    return { ...page, slug };
  };

  getPage = async (workspaceId: string, pageSlug: string) => {
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
    const workspace = await this.storage.get(workspaceId);

    if (!workspace || !workspace.pages || !workspace.pages[pageSlug]) {
      throw new ObjectNotFoundError(`Could not find automation '${pageSlug}'`, {
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
          `Automation slug '${page.slug}' is already used by another automation of your workspace !`
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

    await this.workspaces.updateWorkspace(workspaceId, updatedWorkspace);

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
      `${workspace.id}:${pageSlug}`
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
