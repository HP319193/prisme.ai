import { Broker } from '@prisme.ai/broker';
import { SLUG_VALIDATION_REGEXP } from '../../../../config';
import { EventType } from '../../../eda';
import {
  AlreadyUsedError,
  InvalidSlugError,
  MissingFieldError,
  ObjectNotFoundError,
} from '../../../errors';
import Apps from '../../apps/crud/apps';
import Workspaces from './workspaces';

export interface ListAppsQuery {
  query?: string;
}
class AppInstances {
  private workspaces: Workspaces;
  private apps: Apps;
  private broker: Broker;

  constructor(workspaces: Workspaces, apps: Apps, broker: Broker) {
    this.workspaces = workspaces;
    this.apps = apps;
    this.broker = broker;
  }

  list = async (
    workspaceId: string
  ): Promise<(Prismeai.AppInstance & { slug: string })[]> => {
    const workspace = await this.workspaces.getWorkspace(workspaceId);
    return Object.entries(workspace.imports || {}).reduce(
      (appInstances, [slug, appInstance]) => {
        return [...appInstances, { ...appInstance, slug }];
      },
      [] as any
    );
  };

  private validateSlug(workspace: Prismeai.Workspace, slug: string) {
    if (!slug || !slug.trim()) {
      throw new MissingFieldError('Missing app instance slug', {
        field: 'slug',
      });
    }
    if (!SLUG_VALIDATION_REGEXP.test(slug)) {
      throw new InvalidSlugError(slug);
    }
    if (slug in (workspace.imports || {})) {
      throw new AlreadyUsedError('App instance slug already in use');
    }
  }

  private async validateApp(appId: string, appVersion?: string) {
    try {
      await this.apps.getApp(appId, appVersion);
    } catch {
      throw new ObjectNotFoundError(
        appVersion
          ? `Unknown app '${appId}' or version '${appVersion}'`
          : `Unknown app '${appId}'`
      );
    }
  }

  installApp = async (
    workspaceId: string | Prismeai.Workspace,
    appInstance: Prismeai.AppInstance & { slug: string }
  ) => {
    if (!appInstance.slug) {
      throw new MissingFieldError(`Missing 'slug' field`, { field: 'slug' });
    }
    const workspace =
      typeof workspaceId === 'string'
        ? await this.workspaces.getWorkspace(workspaceId)
        : workspaceId;

    this.validateSlug(workspace, appInstance.slug);
    await this.validateApp(appInstance.appId, appInstance.appVersion);

    const { slug, ...appInstanceWithoutSlug } = appInstance;
    const updatedWorkspace = {
      ...workspace,
      imports: {
        ...(workspace.imports || {}),
        [appInstance.slug]: appInstanceWithoutSlug,
      },
    };
    // Persist only if we've been given a workspaceId string, otherwise simply return the updated workspace
    if (typeof workspaceId === 'string') {
      await this.workspaces.save(workspaceId, updatedWorkspace);
    }

    this.broker.send<Prismeai.InstalledAppInstance['payload']>(
      EventType.InstalledApp,
      { appInstance: appInstanceWithoutSlug, slug },
      {
        appId: appInstance.appId,
        appInstanceSlug: slug,
      }
    );
    return appInstance;
  };

  configureApp = async (
    workspaceId: string | Prismeai.Workspace,
    slug: string,
    appInstancePatch: Partial<Prismeai.AppInstance>
  ) => {
    const workspace =
      typeof workspaceId === 'string'
        ? await this.workspaces.getWorkspace(workspaceId)
        : workspaceId;

    const currentAppInstance = (workspace.imports || {})[slug];
    if (!currentAppInstance) {
      throw new ObjectNotFoundError(`Unknown app instance '${slug}'`);
    }

    delete currentAppInstance.slug;
    const { slug: renamedSlug, ...patchWithoutSlug } = appInstancePatch;
    const appInstance = {
      ...currentAppInstance,
      ...patchWithoutSlug,
    };

    const updatedWorkspace = {
      ...workspace,
      imports: {
        ...workspace.imports,
        [slug]: appInstance,
      },
    };

    // Slug renaming
    let oldSlug;
    if (renamedSlug && renamedSlug !== slug) {
      this.validateSlug(workspace, renamedSlug);
      oldSlug = slug;
      delete updatedWorkspace.imports[oldSlug];
      updatedWorkspace.imports[renamedSlug] = appInstance;
    }

    await this.validateApp(appInstance.appId, appInstance.appVersion);

    // Persist only if we've been given a workspaceId string, otherwise simply return the updated workspace
    if (typeof workspaceId === 'string') {
      await this.workspaces.save(workspaceId, updatedWorkspace);
    }

    this.broker.send<Prismeai.ConfiguredAppInstance['payload']>(
      EventType.ConfiguredApp,
      { appInstance, slug: renamedSlug || slug, oldSlug },
      {
        appId: appInstance.appId,
        appInstanceSlug: renamedSlug || slug,
      }
    );

    return appInstance;
  };

  uninstallApp = async (
    workspaceId: string | Prismeai.Workspace,
    slug: string
  ) => {
    const workspace =
      typeof workspaceId === 'string'
        ? await this.workspaces.getWorkspace(workspaceId)
        : workspaceId;

    const appInstance = (workspace.imports || {})[slug];
    if (!appInstance) {
      throw new ObjectNotFoundError(`Unknown app instance '${slug}'`);
    }

    const { [slug]: removedApp, ...importsWithoutRemovedOne } =
      workspace.imports || {};
    const updatedWorkspace = {
      ...workspace,
      imports: importsWithoutRemovedOne,
    };
    // Persist only if we've been given a workspaceId string, otherwise simply return the updated workspace
    if (typeof workspaceId === 'string') {
      await this.workspaces.save(workspaceId, updatedWorkspace);
    }

    this.broker.send<Prismeai.UninstalledAppInstance['payload']>(
      EventType.UninstalledApp,
      { appInstance, slug },
      {
        appId: appInstance.appId,
        appInstanceSlug: slug,
      }
    );

    return { slug };
  };
}

export default AppInstances;
