import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { AccessManager, Role, SubjectType } from '../../../permissions';
import { nanoid } from 'nanoid';
import { FilterQuery } from '@prisme.ai/permissions';
import { AlreadyUsedError } from '../../../errors';

class Pages {
  private accessManager: Required<AccessManager>;
  private broker: Broker;

  constructor(accessManager: Required<AccessManager>, broker: Broker) {
    this.accessManager = accessManager;
    this.broker = broker;
  }

  createPage = async (workspaceId: string, page: Prismeai.Page) => {
    page.id = nanoid(7);

    await this.accessManager.create(SubjectType.Page, {
      workspaceId,
      ...page,
    });

    this.broker.send<Prismeai.CreatedPage['payload']>(EventType.CreatedPage, {
      page,
    });
    return page;
  };

  list = async (workspaceId: string) => {
    return await this.accessManager.findAll(SubjectType.Page, {
      workspaceId,
    });
  };

  getPage = async (idOrQuery: string | FilterQuery<Prismeai.Page, Role>) => {
    return await this.accessManager.get(SubjectType.Page, idOrQuery);
  };

  updatePage = async (id: string, page: Prismeai.Page) => {
    const currentPage = await this.accessManager.get(SubjectType.Page, id);
    try {
      const updated = await this.accessManager.update(SubjectType.Page, {
        ...currentPage,
        ...page,
        id,
      });
      this.broker.send<Prismeai.UpdatedPage['payload']>(EventType.UpdatedPage, {
        page,
      });
      return updated;
    } catch (e) {
      if ((e as { code: number }).code === 11000) {
        throw new AlreadyUsedError(
          `Page slug '${page.slug}' is already used by another page !`,
          { slug: 'AlreadyUsedError' }
        );
      }
      throw e;
    }
  };

  deletePage = async (id: string) => {
    const page = await this.accessManager.get(SubjectType.Page, id);

    await this.accessManager.delete(SubjectType.Page, id);

    this.broker.send<Prismeai.DeletedPage['payload']>(EventType.DeletedPage, {
      page,
    });
    return { id };
  };
}

export default Pages;
