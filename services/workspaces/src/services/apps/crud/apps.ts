import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { DSULStorage, DSULType } from '../../DSULStorage';
import { AccessManager, SubjectType } from '../../../permissions';
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
import { prepareNewDSULVersion } from '../../../utils/prepareNewDSULVersion';

export interface ListAppsQuery {
  text?: string;
  workspaceId?: string;
  labels?: string;
}

export interface AppDetails {
  slug?: string;
  appName?: Prismeai.LocalizedText;
  config?: Prismeai.Config;
  photo?: string;
  blocks: Prismeai.AppBlocks;
  automations: Prismeai.AppAutomations;
  events: Prismeai.ProcessedEvents;
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
    { text, labels, ...query }: ListAppsQuery = {},
    opts?: FindOptions
  ) => {
    const mongoQuery = {
      ...query,
      ...(labels && {
        labels: {
          $in: labels.split(','),
        },
      }),
    };
    return await this.accessManager.findAll(
      SubjectType.App,
      {
        ...(text?.length
          ? {
              $or: [
                {
                  slug: {
                    $regex: text,
                    $options: 'i',
                  },
                },
                {
                  $text: {
                    $search: text,
                  },
                },
              ],
            }
          : {}),
        ...mongoQuery,
      },
      opts
    );
  };

  publishApp = async (
    publish: PrismeaiAPI.PublishApp.RequestBody,
    versionRequest: Prismeai.WorkspaceVersion
  ) => {
    if (!publish.workspaceId) {
      throw new PrismeError('Please specify workspaceId', {});
    }
    const dsul = await this.storage.get({
      dsulType: DSULType.DSULIndex,
      workspaceId: publish.workspaceId,
      version: publish.workspaceVersion || 'current',
    });
    if (!dsul.photo || !dsul.description) {
      throw new MissingFieldError('Missing photo or description', {
        fields: [
          dsul.photo ? false : 'photo',
          dsul.description ? false : 'description',
        ].filter(Boolean),
      });
    }

    let documentation: Prismeai.App['documentation'];
    try {
      if (dsul.slug) {
        await this.storage.get({
          dsulType: DSULType.DetailedPage,
          workspaceSlug: dsul.slug,
          slug: '_doc',
        });
        documentation = {
          workspaceSlug: dsul.slug!,
          slug: '_doc',
        };
      }
    } catch {}
    const app: Prismeai.App & { id: string } = {
      id: '',
      workspaceId: publish.workspaceId,
      slug: publish.slug!,
      name: dsul.name,
      description: dsul.description,
      photo: dsul.photo,
      documentation,
      labels: dsul.labels,
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
    await Promise.all([
      this.storage.copy(
        {
          workspaceId: app.workspaceId!,
          version: publish.workspaceVersion || 'current',
          parentFolder: true,
        },
        {
          appSlug: app.slug,
          parentFolder: true,
          version: 'current',
        }
      ),
      this.storage.copy(
        {
          workspaceId: app.workspaceId!,
          version: publish.workspaceVersion || 'current',
          parentFolder: true,
        },
        {
          appSlug: app.slug,
          parentFolder: true,
          version: newVersion.name,
        }
      ),
    ]);
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
      await this.storage.get({ appSlug, version: version || 'current' });
      return true;
    } catch {
      throw new ObjectNotFoundError(
        version
          ? `Unknown app '${appSlug}' or version '${version}'`
          : `Unknown app '${appSlug}'`
      );
    }
  };

  getApp = async (appSlug: string, version?: string): Promise<Prismeai.App> => {
    const dsul = await this.storage.get({
      appSlug,
      version: version || 'current',
    });
    const { value, ...config } = dsul.config || {};
    const app = await this.accessManager.get(SubjectType.App, appSlug);
    return {
      ...app,
      config,
    };
  };

  getAppDetails = async (
    appSlug: string,
    version?: string
  ): Promise<AppDetails> => {
    const [app, automations] = await Promise.all([
      this.storage.get({ appSlug, version: version || 'current' }),
      this.storage.folderIndex({
        dsulType: DSULType.AutomationsIndex,
        appSlug,
        version: version || 'current',
        folderIndex: true,
      }),
    ]);
    const filteredAutomations = Object.entries(automations || {})
      .map(([slug, cur]) =>
        cur.disabled || cur.private ? false : { slug, ...cur }
      )
      .filter<Prismeai.AutomationMeta & { slug: string }>(Boolean as any);

    const allEventTriggers = filteredAutomations.reduce<string[]>(
      (listen, automation) => listen.concat(automation?.when?.events || []),
      []
    );
    const allStaticEmits = filteredAutomations.reduce<string[]>(
      (emits, automation) =>
        (emits || []).concat(automation?.events?.emit || []),
      []
    );
    const allAutocompleteEmits = filteredAutomations.reduce<
      Prismeai.Emit['emit'][]
    >(
      (emits, automation) =>
        (emits || []).concat(automation?.events?.autocomplete || []),
      []
    );
    return {
      config: app.config,
      blocks: Object.entries(app.blocks || {}).map(([slug, block]) => {
        return {
          ...block,
          slug,
        };
      }),
      automations: filteredAutomations.map(
        ({ slug, name, description, arguments: automArguments }) => ({
          slug,
          name,
          description,
          arguments: automArguments || {},
        })
      ),
      photo: app.photo,
      events: {
        listen: Array.from(new Set(allEventTriggers)),
        emit: allStaticEmits,
        autocomplete: allAutocompleteEmits,
      },
    };
  };

  deleteApp = async (
    appSlug: PrismeaiAPI.DeleteApp.PathParameters['appSlug']
  ) => {
    const app = await this.accessManager.get(SubjectType.App, appSlug);
    // Load user permissions from workspace
    await this.accessManager.get(SubjectType.Workspace, app.workspaceId);
    await this.accessManager.delete(SubjectType.App, appSlug);
    await this.storage.delete({ appSlug, parentFolder: true });
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
