import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import DSULStorage from '../../DSULStorage';
import { AccessManager, SubjectType } from '../../../permissions';
import {
  AlreadyUsedError,
  InvalidSlugError,
  MissingFieldError,
  PrismeError,
} from '../../../errors';
import { FindOptions } from '@prisme.ai/permissions';
import { SLUG_VALIDATION_REGEXP } from '../../../../config';

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

    // Fetch existing workspace app
    let existingApp = await this.accessManager.findAll(SubjectType.App, {
      workspaceId: app.workspaceId,
    });

    // If workspace app already exists, prevents any slug renaming
    if (existingApp?.length) {
      if (app.slug && existingApp[0].slug !== app.slug) {
        throw new PrismeError(
          'Once published, an app slug cannot be updated.',
          {}
        );
      }
      app.slug = existingApp[0].slug;
    } else {
      // New app
      if (!app.slug) {
        throw new MissingFieldError('Please specify app.slug', {
          field: 'slug',
        });
      }
      if (!SLUG_VALIDATION_REGEXP.test(app.slug)) {
        throw new InvalidSlugError(app.slug);
      }
    }

    if (!app.name) {
      app.name = existingApp?.[0]?.name || dsul.name;
    }

    // Build updated versions list
    const existingVersions = existingApp?.[0]?.versions || [];
    const releaseName = `${(parseInt(existingVersions[0]) || 0) + 1}`;
    app.versions = [releaseName, ...(existingVersions || [])];

    // Check permissions & create/update App object
    (<any>app).id = app.slug!;
    if (existingApp?.length) {
      await this.accessManager.update(SubjectType.App, app);
    } else {
      try {
        await this.accessManager.create(SubjectType.App, app);
      } catch (error) {
        if (
          (<any>error).message &&
          (<any>error).message.includes('duplicate key error')
        ) {
          throw new AlreadyUsedError(`App slug '${app.slug}' already used`, {
            slug: app.slug,
          });
        }
        throw error;
      }
    }

    // Store corresponding DSUL
    this.storage.save(app.slug!, dsul, 'current');
    await this.storage.save(app.slug!, dsul, releaseName);
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

  getApp = async (appSlug: string, version?: string) => {
    await this.accessManager.get(SubjectType.App, appSlug);
    return await this.storage.get(appSlug, version || 'current');
  };

  getAppDetails = async (
    appId: string,
    version?: string
  ): Promise<Prismeai.AppDetails> => {
    const app = await this.storage.get(appId, version || 'current');
    return {
      config: app.config,
      widgets: Object.entries(app.widgets || {}).map(
        ([slug, { name, description, url }]) => ({
          slug,
          url,
          name,
          description,
        })
      ),
      automations: Object.entries(
        app.automations || {}
      ).map(([slug, { name, description }]) => ({ slug, name, description })),
    };
  };

  getAvailableSlugs = async (
    appId: string,
    version?: string
  ): Promise<Prismeai.AppDetails> => {
    const app = await this.storage.get(appId, version || 'current');
    return {
      widgets: Object.entries(app.widgets || {}).map(
        ([slug, { name, description }]) => ({
          slug,
          name,
          description,
        })
      ),
      automations: Object.entries(app.automations || {}).map(
        ([slug, { name, description }]) => ({ slug, name, description })
      ),
    };
  };

  deleteApp = async (
    appSlug: PrismeaiAPI.DeleteApp.PathParameters['appSlug']
  ) => {
    const app = await this.accessManager.get(SubjectType.App, appSlug);
    // Load user permissions from workspace
    await this.accessManager.get(SubjectType.Workspace, app.workspaceId);
    await this.accessManager.delete(SubjectType.App, appSlug);
    await this.storage.delete(appSlug);
    this.broker.send<Prismeai.DeletedApp['payload']>(
      EventType.DeletedApp,
      {
        appSlug,
      },
      {
        workspaceId: app.workspaceId,
      }
    );
    return { id: appSlug };
  };
}

export default Apps;
