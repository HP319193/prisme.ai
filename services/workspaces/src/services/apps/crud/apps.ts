import { nanoid } from 'nanoid';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import DSULStorage from '../../DSULStorage';
import { AccessManager, SubjectType } from '../../../permissions';
import { PrismeError } from '../../../errors';
import { FindOptions } from '@prisme.ai/permissions';

export interface ListAppsQuery {
  query?: string;
}
class Apps {
  private accessManager: Required<AccessManager>;
  private broker: Broker;
  private storage: DSULStorage;

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    storage: DSULStorage
  ) {
    this.accessManager = accessManager;
    this.broker = broker;
    this.storage = storage;
  }

  listApps = async (query?: ListAppsQuery, opts?: FindOptions) => {
    return await this.accessManager.findAll(
      SubjectType.App,
      query?.query?.length
        ? {
            $text: {
              $search: query?.query,
            },
          }
        : {},
      opts
    );
  };

  publishApp = async (app: Prismeai.App, dsul: Prismeai.DSUL) => {
    if (!app.workspaceId) {
      throw new PrismeError('Please specify app.workspaceId', {});
    }

    app.id = undefined;
    // Build updated versions list
    let existingApp = await this.accessManager.findAll(SubjectType.App, {
      workspaceId: app.workspaceId,
    });
    app.id = existingApp?.[0]?.id;
    if (!app.name) {
      app.name = existingApp?.[0]?.name || dsul.name;
    }

    const existingVersions = existingApp?.[0]?.versions || [];
    const releaseName = `${(parseInt(existingVersions[0]) || 0) + 1}`;
    app.versions = [releaseName, ...(existingVersions || [])];

    // Check permissions & create/update App object
    if (app.id) {
      await this.accessManager.update(SubjectType.App, app);
    } else {
      app.id = nanoid(7);
      await this.accessManager.create(SubjectType.App, app);
    }

    // Store corresponding DSUL
    this.storage.save(app.id, dsul, 'current');
    await this.storage.save(app.id, dsul, releaseName);
    this.broker.send<Prismeai.PublishedApp['payload']>(
      EventType.PublishedApp,
      {
        app,
      },
      {
        workspaceId: app.workspaceId,
      }
    );
    return app;
  };

  getApp = async (appId: string, version?: string) => {
    await this.accessManager.get(SubjectType.App, appId);
    return await this.storage.get(appId, version || 'current');
  };

  deleteApp = async (appId: PrismeaiAPI.DeleteApp.PathParameters['appId']) => {
    const app = await this.accessManager.get(SubjectType.App, appId);
    // Load user permissions from workspace
    await this.accessManager.get(SubjectType.Workspace, app.workspaceId);
    await this.accessManager.delete(SubjectType.App, appId);
    await this.storage.delete(appId);
    this.broker.send<Prismeai.DeletedApp['payload']>(
      EventType.DeletedApp,
      {
        appId,
      },
      {
        workspaceId: app.workspaceId,
      }
    );
    return { id: appId };
  };
}

export default Apps;
