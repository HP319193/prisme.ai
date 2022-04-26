import yaml from 'js-yaml';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../eda';
import { ObjectNotFoundError } from '../../errors';
import Storage, { StorageOptions } from '../../storage';
import { DriverType } from '../../storage/types';
import { Workspace } from './workspace';
import { Apps } from '../apps';

export * from './workspace';

export class Workspaces extends Storage {
  private broker: Broker;
  private apps: Apps;
  private workspaces: Record<string, Workspace>;
  private watchedApps: Record<string, string[]>;

  constructor(
    driverType: DriverType,
    driverOptions: StorageOptions[DriverType],
    apps: Apps,
    broker: Broker
  ) {
    super(driverType, driverOptions);
    this.workspaces = {};
    this.apps = apps;
    this.broker = broker;
    this.watchedApps = {};
  }

  startLiveUpdates() {
    const listenedEvents = [
      EventType.UpdatedWorkspace,
      EventType.DeletedWorkspace,
      EventType.CreatedAutomation,
      EventType.UpdatedAutomation,
      EventType.DeletedAutomation,
      EventType.InstalledApp,
      EventType.UninstalledApp,
      EventType.ConfiguredApp,
      EventType.PublishedApp,
    ];

    this.broker.on(
      listenedEvents,
      async (event, broker, { logger }) => {
        if (event.type === EventType.PublishedApp) {
          const publishedApp = (event as any as Prismeai.PublishedApp).payload
            .app;
          if (publishedApp.slug && publishedApp.slug in this.watchedApps) {
            await this.apps.fetchApp(publishedApp.slug, 'current');
            const updateWorkspaceIds = this.watchedApps[publishedApp.slug];
            updateWorkspaceIds.map((workspaceId) =>
              this.fetchWorkspace(workspaceId)
            );
          }
        }
        const workspaceId = event.source.workspaceId;
        if (!workspaceId || !(workspaceId in this.workspaces)) {
          return true;
        }
        const workspace = this.workspaces[workspaceId];

        logger.info({
          msg: 'Received an updated workspace through events',
          event,
        });
        switch (event.type) {
          case EventType.DeletedWorkspace:
            // TODO better way to enforce this is executed after runtime processEvent
            setTimeout(() => {
              delete this.workspaces[workspaceId];
            }, 5000);
            break;
          case EventType.UpdatedWorkspace:
            const {
              payload: { workspace: newWorkspace },
            } = event as any as Prismeai.UpdatedWorkspace;
            workspace.update(newWorkspace);
            break;
          case EventType.CreatedAutomation:
          case EventType.UpdatedAutomation:
            const {
              payload: { automation, slug, oldSlug },
            } = event as any as Prismeai.UpdatedAutomation;
            workspace.updateAutomation(slug, automation);
            if (oldSlug) {
              workspace.deleteAutomation(oldSlug);
            }
            break;
          case EventType.DeletedAutomation:
            const deletedAutomation = (
              event as any as Prismeai.DeletedAutomation
            ).payload.automation;
            workspace.deleteAutomation(deletedAutomation.slug);
            break;
          case EventType.InstalledApp:
          case EventType.ConfiguredApp:
            const {
              payload: {
                appInstance,
                slug: appInstanceSlug,
                oldSlug: appInstanceOldSlug,
              },
            } = event as any as Prismeai.ConfiguredAppInstance;
            workspace.updateImport(appInstanceSlug, appInstance);
            if (appInstanceOldSlug) {
              workspace.deleteImport(appInstanceOldSlug);
            }
            this.watchAppCurrentVersions(workspaceId, [appInstance]);
            break;
          case EventType.UninstalledApp:
            const uninstalledAppInstanceSlug = (
              event as any as Prismeai.UninstalledAppInstance
            ).payload.slug;
            workspace.deleteImport(uninstalledAppInstanceSlug);
            break;
        }
        return true;
      },
      {
        GroupPartitions: false, // Every instance must be notified
      }
    );
  }

  async getWorkspace(workspaceId: string) {
    if (!(workspaceId in this.workspaces)) {
      await this.fetchWorkspace(workspaceId);
    }
    return this.workspaces[workspaceId];
  }

  async watchAppCurrentVersions(
    workspaceId: string,
    imports: Prismeai.AppInstance[]
  ) {
    const requiredApps = Object.values(imports || {})
      .filter(({ appVersion }) => !appVersion || appVersion === 'current')
      .map(({ appSlug }) => appSlug);
    this.watchedApps = requiredApps.reduce(
      (watchedApps, watchAppId) => ({
        ...watchedApps,
        [watchAppId]: [
          ...new Set([...(watchedApps[watchAppId] || []), workspaceId]),
        ],
      }),
      this.watchedApps
    );
  }

  async fetchWorkspace(workspaceId: string): Promise<Prismeai.Workspace> {
    try {
      const raw = await this.driver.get(
        `workspaces/${workspaceId}/current.yml`
      );
      const dsul = yaml.load(raw) as Prismeai.Workspace;
      this.workspaces[workspaceId] = await Workspace.create(dsul, this.apps);

      // Check imported apps & update watched app current versions
      if (dsul.imports) {
        this.watchAppCurrentVersions(workspaceId, Object.values(dsul.imports));
      }

      return dsul;
    } catch (err) {
      if (err instanceof ObjectNotFoundError) {
        throw new ObjectNotFoundError(`Workspace not found`, { workspaceId });
      }
      throw err;
    }
  }
}
