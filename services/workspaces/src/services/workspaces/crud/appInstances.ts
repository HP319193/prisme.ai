import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { ObjectNotFoundError } from '../../../errors';
import { AccessManager, ActionType, SubjectType } from '../../../permissions';
import Apps from '../../apps/crud/apps';
import { DSULStorage, DSULType } from '../../dsulStorage';

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
  ): Promise<(Prismeai.AppInstanceMeta & { slug: string })[]> => {
    await this.accessManager.throwUnlessCan(
      ActionType.Read,
      SubjectType.Workspace,
      workspaceId
    );
    const imports = await this.storage.folderIndex({
      dsulType: DSULType.ImportsIndex,
      workspaceId,
    });
    return Object.entries(imports || {}).reduce<
      (Prismeai.AppInstanceMeta & { slug: string })[]
    >((appInstances, [slug, appInstance]) => {
      return [...appInstances, { ...appInstance, slug }];
    }, []);
  };

  getDetailedList = async (
    workspaceId: string
  ): Promise<Prismeai.AppInstanceList> => {
    const appInstances = await this.list(workspaceId);

    return (
      await Promise.all(
        appInstances.map<Promise<Prismeai.AppInstanceList[0] | false>>(
          async (cur) => {
            try {
              const appDetails = await this.apps.getAppDetails(
                cur.appSlug,
                cur.appVersion
              );

              return {
                ...cur,
                slug: cur.slug!,
                photo: appDetails?.photo,
                automations: appDetails?.automations,
                events: appDetails?.events,
                blocks: (appDetails.blocks || []).map((block) => {
                  if (block?.slug) {
                    block.slug = `${cur.slug}.${block.slug}`;
                  }
                  return block;
                }),
              };
            } catch (error) {
              // If app does not exist anymore, just ignore this instance
              return false;
            }
          }
        )
      )
    ).filter<Prismeai.AppInstanceList[0]>(Boolean as any);
  };

  getAppInstance = async (
    workspaceId: string,
    slug: string
  ): Promise<Prismeai.AppInstance & { slug: string }> => {
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
    return { ...appInstance, slug };
  };

  getDetailedAppInstance = async (
    workspaceId: string,
    slug: string
  ): Promise<Prismeai.DetailedAppInstance & { slug: string }> => {
    const appInstance = await this.getAppInstance(workspaceId, slug);
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
      blocks: (appDetails.blocks || []).map((block) => {
        if (block?.slug) {
          block.slug = `${slug}.${block.slug}`;
        }
        return block;
      }),
      slug,
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

    await this.storage.save(
      {
        workspaceId,
        slug: appInstance.slug,
      },
      appInstance,
      {
        mode: replace ? 'replace' : 'create',
        updatedBy: this.accessManager.user?.id,
      }
    );

    this.broker.send<Prismeai.InstalledAppInstance['payload']>(
      EventType.InstalledApp,
      { appInstance, slug: appInstance.slug },
      {
        appSlug: appInstance.appSlug,
        appInstanceFullSlug: appInstance.slug,
        workspaceId,
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
            ? slug
            : undefined,
      },
      {
        appSlug: appInstance.appSlug,
        appInstanceFullSlug: appInstance.slug,
        workspaceId,
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
    });

    this.broker.send<Prismeai.UninstalledAppInstance['payload']>(
      EventType.UninstalledApp,
      { slug },
      {
        appSlug: appInstance.appSlug,
        appInstanceFullSlug: slug,
        workspaceId,
      }
    );

    return { slug };
  };
}

export default AppInstances;
