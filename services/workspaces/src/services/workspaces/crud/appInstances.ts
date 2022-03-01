import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import {
  AlreadyUsedError,
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

  list = async (workspaceId: string) => {
    const workspace = await this.workspaces.getWorkspace(workspaceId);
    return workspace.imports || [];
  };

  private validateSlug(workspace: Prismeai.Workspace, slug: string) {
    if (!slug || !slug.trim()) {
      throw new MissingFieldError('Missing app instance slug', {
        field: 'slug',
      });
    }
    if ((workspace.imports || []).find((cur) => cur.slug === slug)) {
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
    appInstance: Prismeai.AppInstance
  ) => {
    const workspace =
      typeof workspaceId === 'string'
        ? await this.workspaces.getWorkspace(workspaceId)
        : workspaceId;

    this.validateSlug(workspace, appInstance.slug);
    await this.validateApp(appInstance.appId, appInstance.appVersion);

    const updatedWorkspace = {
      ...workspace,
      imports: [...(workspace.imports || []), appInstance],
    };
    // Persist only if we've been given a workspaceId string, otherwise simply return the updated workspace
    if (typeof workspaceId === 'string') {
      await this.workspaces.save(workspaceId, updatedWorkspace);
    }

    this.broker.send<Prismeai.InstalledAppInstance['payload']>(
      EventType.InstalledApp,
      appInstance
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

    const currentAppInstance = (workspace.imports || []).find(
      (cur) => cur.slug === slug
    );
    if (!currentAppInstance) {
      throw new ObjectNotFoundError(`Unknown app instance '${slug}'`);
    }

    const appInstance = {
      ...currentAppInstance,
      ...appInstancePatch,
    };
    // Slug renaming
    if (appInstance.slug && appInstance.slug !== slug) {
      this.validateSlug(workspace, appInstance.slug);
    }

    await this.validateApp(appInstance.appId, appInstance.appVersion);

    const updatedWorkspace = {
      ...workspace,
      imports: (workspace.imports || []).map((cur) =>
        cur.slug !== slug ? cur : appInstance
      ),
    };
    // Persist only if we've been given a workspaceId string, otherwise simply return the updated workspace
    if (typeof workspaceId === 'string') {
      await this.workspaces.save(workspaceId, updatedWorkspace);
    }

    this.broker.send<Prismeai.InstalledAppInstance['payload']>(
      EventType.ConfiguredApp,
      appInstance
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

    const appInstance = (workspace.imports || []).find(
      (cur) => cur.slug === slug
    );
    if (!appInstance) {
      throw new ObjectNotFoundError(`Unknown app instance '${slug}'`);
    }

    const updatedWorkspace = {
      ...workspace,
      imports: (workspace.imports || []).filter((cur) => cur.slug !== slug),
    };
    // Persist only if we've been given a workspaceId string, otherwise simply return the updated workspace
    if (typeof workspaceId === 'string') {
      await this.workspaces.save(workspaceId, updatedWorkspace);
    }

    this.broker.send<Prismeai.InstalledAppInstance['payload']>(
      EventType.UninstalledApp,
      appInstance
    );

    return { slug };
  };
}

export default AppInstances;
