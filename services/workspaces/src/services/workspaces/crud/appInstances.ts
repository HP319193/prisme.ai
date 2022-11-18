import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { ObjectNotFoundError } from '../../../errors';
import { AccessManager, ActionType, SubjectType } from '../../../permissions';
import Apps from '../../apps/crud/apps';
import DSULStorage, { DSULType } from '../../DSULStorage';

export interface ListAppsQuery {
  query?: string;
}
class AppInstances {
  private accessManager: Required<AccessManager>;
  private broker: Broker;
  private storage: DSULStorage<DSULType.Imports>;
  private apps: Apps;

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    workspacesStorage: DSULStorage,
    apps: Apps
  ) {
    this.accessManager = accessManager;
    this.broker = broker;
    this.storage = workspacesStorage.child(DSULType.Imports);
    this.apps = apps;
  }

  list = async (
    workspaceId: string
  ): Promise<(Prismeai.DetailedAppInstance & { slug: string })[]> => {
    await this.accessManager.throwUnlessCan(
      ActionType.Read,
      SubjectType.Workspace,
      workspaceId
    );
    const imports = await this.storage.folderIndex({
      dsulType: DSULType.Imports,
      workspaceId,
    });
    const appInstances = Object.entries(imports || {}).reduce(
      (appInstances, [slug, appInstance]) => {
        return [...appInstances, { ...appInstance, slug }];
      },
      [] as any
    );

    return (
      await Promise.all(
        appInstances.map(async (cur: Prismeai.AppInstance) => {
          try {
            const appDetails = await this.apps.getAppDetails(
              cur.appSlug,
              cur.appVersion
            );

            return {
              ...cur,
              ...appDetails,
              blocks: (appDetails.blocks || []).map((block) => {
                if (block?.slug) {
                  block.slug = `${cur.slug}.${block.slug}`;
                }
                return block;
              }),
              config: {
                ...appDetails?.config,
                value: cur.config || {},
              },
            };
          } catch (error) {
            // If app does not exist anymore, just ignore this instance
            return undefined;
          }
        })
      )
    ).filter(Boolean);
  };

  get = async (
    workspaceId: string,
    slug: string
  ): Promise<Prismeai.DetailedAppInstance & { slug: string }> => {
    await this.accessManager.throwUnlessCan(
      ActionType.Read,
      SubjectType.Workspace,
      workspaceId
    );

    const appInstance = await this.storage.get({
      workspaceId,
      slug,
      dsulType: DSULType.Imports,
    });
    if (!appInstance) {
      throw new ObjectNotFoundError(`Unknown app instance '${slug}'`);
    }
    const appDetails = await this.apps.getAppDetails(
      appInstance.appSlug,
      appInstance.appVersion
    );
    return {
      ...appInstance,
      ...appDetails,
      config: {
        ...appDetails?.config,
        value: appInstance.config || {},
      },
      slug,
      photo: appDetails.photo,
    };
  };

  installApp = async (
    workspaceId: string,
    appInstance: Prismeai.AppInstance & { slug: string },
    replace: boolean = false // Force update if it already exists
  ) => {
    await this.accessManager.throwUnlessCan(
      ActionType.Update,
      SubjectType.Workspace,
      workspaceId
    );

    // For legacy migration,, do not check that app exists as it might not be migrated yet
    if (!replace) {
      await this.apps.exists(appInstance.appSlug, appInstance.appVersion);
    }

    const { slug, ...appInstanceWithoutSlug } = appInstance;
    await this.storage.save(
      {
        workspaceId,
        slug: appInstance.slug,
        dsulType: DSULType.Imports,
      },
      appInstance,
      {
        mode: replace ? 'replace' : 'create',
        updatedBy: this.accessManager.user?.id,
      }
    );

    this.broker.send<Prismeai.InstalledAppInstance['payload']>(
      EventType.InstalledApp,
      { appInstance: appInstanceWithoutSlug, slug },
      {
        appSlug: appInstance.appSlug,
        appInstanceFullSlug: slug,
      }
    );
    return appInstance;
  };

  configureApp = async (
    workspaceId: string,
    slug: string,
    appInstancePatch: Partial<Prismeai.AppInstance>
  ) => {
    await this.accessManager.throwUnlessCan(
      ActionType.Update,
      SubjectType.Workspace,
      workspaceId
    );

    const currentAppInstance = await this.storage.get({
      workspaceId,
      slug,
      dsulType: DSULType.Imports,
    });
    if (!currentAppInstance) {
      throw new ObjectNotFoundError(`Unknown app instance '${slug}'`);
    }
    const appInstance = {
      ...currentAppInstance,
      slug,
      ...appInstancePatch,
    };

    await this.apps.exists(appInstance.appSlug, appInstance.appVersion);
    await this.storage.save(
      {
        workspaceId,
        slug,
        dsulType: DSULType.Imports,
      },
      appInstance,
      {
        mode: 'update',
        updatedBy: this.accessManager.user?.id,
      }
    );

    this.broker.send<Prismeai.ConfiguredAppInstance['payload']>(
      EventType.ConfiguredApp,
      {
        appInstance: {
          ...appInstance,
          oldConfig: currentAppInstance.config || {},
        },
        slug: appInstance.slug,
        oldSlug:
          appInstancePatch.slug && appInstancePatch.slug !== slug
            ? appInstancePatch.slug
            : undefined,
      },
      {
        appSlug: appInstance.appSlug,
        appInstanceFullSlug: appInstance.slug,
      }
    );

    return appInstance;
  };

  uninstallApp = async (workspaceId: string, slug: string) => {
    await this.accessManager.throwUnlessCan(
      ActionType.Update,
      SubjectType.Workspace,
      workspaceId
    );
    const appInstance = await this.storage.get({
      workspaceId,
      slug,
      dsulType: DSULType.Imports,
    });
    await this.storage.delete({
      workspaceId,
      slug: slug,
      dsulType: DSULType.Imports,
    });

    this.broker.send<Prismeai.UninstalledAppInstance['payload']>(
      EventType.UninstalledApp,
      { slug },
      {
        appSlug: appInstance.appSlug,
        appInstanceFullSlug: slug,
      }
    );

    return { slug };
  };
}

export default AppInstances;
