import { nanoid } from 'nanoid';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import DSULStorage from '../../DSULStorage';
import { AccessManager, SubjectType } from '../../../permissions';
import { workspaces as workspacesServices } from '../..';
import { PrismeError } from '../../../errors';

class Apps {
  private accessManager: Required<AccessManager>;
  private workspaces: ReturnType<typeof workspacesServices>;
  private broker: Broker;
  private storage: DSULStorage;

  constructor(
    accessManager: Required<AccessManager>,
    workspaces: ReturnType<typeof workspacesServices>,
    broker: Broker,
    storage: DSULStorage
  ) {
    this.accessManager = accessManager;
    this.workspaces = workspaces;
    this.broker = broker;
    this.storage = storage;
  }

  listApps = async () => {
    return await this.accessManager.findAll(SubjectType.App);
  };

  publishApp = async (app: Prismeai.App) => {
    if (!app.workspaceId) {
      throw new PrismeError('Please specify app.workspaceId', {});
    }

    const latestRelease = await this.workspaces.getWorkspace(app.workspaceId);

    app.id = undefined;
    // Build updated versions list
    let existingApp = await this.accessManager.findAll(SubjectType.App, {
      workspaceId: app.workspaceId,
    });
    app.id = existingApp?.[0]?.id;
    const existingVersions = existingApp?.[0]?.versions || [];
    const releaseName = `${(parseInt(existingVersions[0]) || 0) + 1}`;
    if (existingVersions.length) {
      app.versions = [releaseName, ...existingVersions];
    } else {
      app.versions = ['0'];
    }

    // Check permissions & create/update App object
    if (app.id) {
      await this.accessManager.update(SubjectType.App, app);
    } else {
      app.id = nanoid(7);
      await this.accessManager.create(SubjectType.App, app);
    }

    // Store corresponding DSUL
    this.storage.save(app.id, latestRelease, 'current');
    await this.storage.save(app.id, latestRelease, releaseName);
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
