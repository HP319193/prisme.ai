import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import DSULStorage from '../../DSULStorage';
import { AccessManager, ActionType, SubjectType } from '../../../permissions';
import {
  AlreadyUsedError,
  InvalidSlugError,
  MissingFieldError,
  ObjectNotFoundError,
  PrismeError,
} from '../../../errors';
import { FindOptions } from '@prisme.ai/permissions';
import {
  MAXIMUM_APP_VERSION,
  SLUG_VALIDATION_REGEXP,
} from '../../../../config';
import { extractEvents } from './extractEvents';
import { prepareNewDSULVersion } from '../../../utils/prepareNewDSULVersion';

export interface ListAppsQuery {
  text?: string;
  workspaceId?: string;
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

  listApps = async (
    { text, ...query }: ListAppsQuery = {},
    opts?: FindOptions
  ) => {
    return await this.accessManager.findAll(
      SubjectType.App,
      {
        ...(text?.length
          ? {
              $text: {
                $search: text,
              },
            }
          : {}),
        ...query,
      },
      opts
    );
  };

  publishApp = async (
    publish: PrismeaiAPI.PublishApp.RequestBody,
    dsul: Prismeai.DSUL,
    versionRequest: Prismeai.WorkspaceVersion
  ) => {
    if (!publish.workspaceId) {
      throw new PrismeError('Please specify workspaceId', {});
    }
    if (!dsul.photo || !dsul.description) {
      throw new MissingFieldError('Missing photo or description', {
        fields: [
          dsul.photo ? false : 'photo',
          dsul.description ? false : 'description',
        ].filter(Boolean),
      });
    }

    const app: Prismeai.App = {
      workspaceId: publish.workspaceId,
      slug: publish.slug,
      name: dsul.name,
      description: dsul.description,
      photo: dsul.photo,
    };
    // Fetch existing workspace app
    let existingApp = await this.accessManager.findAll(SubjectType.App, {
      workspaceId: publish.workspaceId,
    });

    // If workspace app already exists, prevents any slug renaming
    if (existingApp?.length) {
      if (publish.slug && existingApp[0].slug !== publish.slug) {
        throw new PrismeError(
          'Once published, an app slug cannot be updated.',
          {}
        );
      }
      app.slug = existingApp[0].slug;
    } else {
      // New app
      if (!app.slug) {
        throw new MissingFieldError('Please specify slug', {
          field: 'slug',
        });
      }
      if (!SLUG_VALIDATION_REGEXP.test(app.slug)) {
        throw new InvalidSlugError(app.slug);
      }
    }

    // Build updated versions list
    let oldVersions = existingApp?.[0]?.versions || [];
    let existingVersions;
    // Old app version conversion
    if (typeof oldVersions[0] !== 'object') {
      const createdAt = `${new Date().toISOString()}`;
      existingVersions = oldVersions.map<Required<Prismeai.WorkspaceVersion>>(
        (cur) =>
          typeof cur == 'object'
            ? (cur as Required<Prismeai.WorkspaceVersion>)
            : {
                name: cur,
                description: `Version ${cur}`,
                createdAt,
              }
      );
    } else {
      existingVersions = oldVersions as Required<Prismeai.WorkspaceVersion>[];
    }
    const { newVersion, allVersions } = prepareNewDSULVersion(
      existingVersions,
      versionRequest,
      MAXIMUM_APP_VERSION
    );
    app.versions = allVersions;

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
    await this.storage.save(app.slug!, dsul, newVersion.name);
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

  exists = async (appSlug: string, version?: string) => {
    try {
      await this.storage.get(appSlug, version || 'current');
      return true;
    } catch {
      throw new ObjectNotFoundError(
        version
          ? `Unknown app '${appSlug}' or version '${version}'`
          : `Unknown app '${appSlug}'`
      );
    }
  };

  getApp = async (appSlug: string, version?: string) => {
    await this.accessManager.throwUnlessCan(
      ActionType.GetAppSourceCode,
      SubjectType.App,
      appSlug
    );
    return await this.storage.get(appSlug, version || 'current');
  };

  getAppDetails = async (
    appId: string,
    version?: string
  ): Promise<Prismeai.AppDetails> => {
    const app = await this.storage.get(appId, version || 'current');

    return {
      config: app.config,
      blocks: Object.entries(app.blocks || {}).map(
        ([slug, { name, description, url, edit }]) => ({
          slug,
          url,
          name,
          description,
          edit,
        })
      ),
      automations: Object.entries(app.automations || {})
        .filter(([slug, { private: privateAutomation }]) => !privateAutomation)
        .map(([slug, { name, description, arguments: args }]) => ({
          slug,
          name,
          description,
          arguments: args,
        })),
      photo: app.photo,
      events: extractEvents(app),
    };
  };

  getAvailableSlugs = async (
    appId: string,
    version?: string
  ): Promise<Prismeai.AppDetails> => {
    const app = await this.storage.get(appId, version || 'current');
    return {
      blocks: Object.entries(app.blocks || {}).map(
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
