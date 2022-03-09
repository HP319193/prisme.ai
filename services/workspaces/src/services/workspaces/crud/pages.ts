import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { AccessManager, SubjectType } from '../../../permissions';
import { nanoid } from 'nanoid';

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

  getPage = async (id: string) => {
    return await this.accessManager.get(SubjectType.Page, id);
  };

  updatePage = async (id: string, page: Prismeai.Page) => {
    const currentPage = await this.accessManager.get(SubjectType.Page, id);
    const updated = await this.accessManager.update(SubjectType.Page, {
      ...currentPage,
      ...page,
      id,
    });

    this.broker.send<Prismeai.UpdatedPage['payload']>(EventType.UpdatedPage, {
      page,
    });
    return updated;
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
