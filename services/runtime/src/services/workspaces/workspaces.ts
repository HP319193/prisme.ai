import yaml from 'js-yaml';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../eda';
import { ObjectNotFoundError, SuspendedWorkspaceError } from '../../errors';
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
      EventType.CreatedWorkspace,
      EventType.ConfiguredWorkspace,
      EventType.DeletedWorkspace,
      EventType.CreatedAutomation,
      EventType.UpdatedAutomation,
      EventType.DeletedAutomation,
      EventType.InstalledApp,
      EventType.UninstalledApp,
      EventType.ConfiguredApp,
      EventType.PublishedApp,
      EventType.SuspendedWorkspace,
    ];

    this.broker.on(
      listenedEvents,
      async (event, broker, { logger }) => {
        if (event.type === EventType.SuspendedWorkspace) {
          const suspended = (event as any as Prismeai.SuspendedWorkspace)
            .payload;
          await this.suspendWorkspace(suspended);
          if (suspended.suspended) {
            logger.info(
              `Suspended workspace ${suspended.workspaceId} execution`
            );
          } else {
            logger.info(`Resumed workspace ${suspended.workspaceId} execution`);
          }
          return true;
        }

        if (event.type === EventType.CreatedWorkspace) {
          const workspace = (event as any as Prismeai.CreatedWorkspace).payload
            .workspace;
          try {
            // In case of a duplicated workspace, the model should have been already duplicated
            await this.fetchWorkspace(workspace.id!);
          } catch {
            // Otherwise, simply init the model
            await this.loadWorkspace(workspace);
            await this.saveWorkspace(workspace);
          }
          return true;
        }

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
        if (!workspaceId) {
          return true;
        }
        if (!(workspaceId in this.workspaces)) {
          try {
            await this.fetchWorkspace(workspaceId);
          } catch (error) {
            const workspace = {
              id: workspaceId,
              name: 'Workspace name has been reset',
            };
            await this.loadWorkspace(workspace);
            await this.saveWorkspace(workspace);
          }
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
          case EventType.ConfiguredWorkspace:
            const {
              payload: { config },
            } = event as any as Prismeai.ConfiguredWorkspace;
            workspace.updateConfig(config);
            break;
          case EventType.CreatedAutomation:
          case EventType.UpdatedAutomation:
            const {
              payload: { automation, slug, oldSlug },
            } = event as any as Prismeai.UpdatedAutomation;
            await workspace.updateAutomation(slug, automation);
            if (oldSlug) {
              await workspace.deleteAutomation(oldSlug);
            }
            break;
          case EventType.DeletedAutomation:
            const deletedAutomation = (
              event as any as Prismeai.DeletedAutomation
            ).payload.automationSlug;
            await workspace.deleteAutomation(deletedAutomation);
            break;
          case EventType.InstalledApp:
          case EventType.ConfiguredApp:
            const {
              payload: {
                appInstance: { oldConfig, ...appInstance },
                slug: appInstanceSlug,
                oldSlug: appInstanceOldSlug,
              },
            } = event as any as Prismeai.ConfiguredAppInstance;
            await workspace.updateImport(appInstanceSlug, appInstance);
            if (appInstanceOldSlug) {
              await workspace.deleteImport(appInstanceOldSlug);
            }
            this.watchAppCurrentVersions(workspace);
            break;
          case EventType.UninstalledApp:
            const uninstalledAppInstanceSlug = (
              event as any as Prismeai.UninstalledAppInstance
            ).payload.slug;
            // TODO better way to enforce this is executed after runtime processEvent
            delete workspace.dsul.imports?.[uninstalledAppInstanceSlug];
            new Promise((resolve) => {
              setTimeout(async () => {
                await workspace.deleteImport(uninstalledAppInstanceSlug);
                resolve(undefined);
              }, 500);
            });
            break;
        }

        await this.saveWorkspace(workspace.dsul);
        logger.info({
          msg: 'Persisted updated runtime.yml',
          workspaceId: workspace.id,
        });
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
    if (this.workspaces[workspaceId]?.status?.suspended) {
      throw new SuspendedWorkspaceError(
        this.workspaces[workspaceId]
          .status as Prismeai.SuspendedWorkspace['payload']
      );
    }
    return this.workspaces[workspaceId];
  }

  async suspendWorkspace(status: Prismeai.SuspendedWorkspace['payload']) {
    if (status.suspended) {
      this.workspaces[status.workspaceId] = await Workspace.create(
        {} as Prismeai.Workspace,
        undefined as any
      );
      this.workspaces[status.workspaceId].status = status;
      await this.driver.save(
        `workspaces/${status.workspaceId}/status.yml`,
        yaml.dump(status)
      );
    } else {
      try {
        await this.driver.delete(`workspaces/${status.workspaceId}/status.yml`);
      } catch {} // Since all instances would try to delete only 1 can succeed
      await this.fetchWorkspace(status.workspaceId);
    }
  }

  async watchAppCurrentVersions(workspace: Workspace) {
    const nestedApps = [
      ...new Set(Object.values(workspace.listNestedImports())),
    ];

    this.watchedApps = nestedApps.reduce(
      (watchedApps, watchAppId) => ({
        ...watchedApps,
        [watchAppId]: [
          ...new Set([...(watchedApps[watchAppId] || []), workspace.id]),
        ],
      }),
      this.watchedApps
    );
  }

  async fetchWorkspace(workspaceId: string): Promise<Prismeai.RuntimeModel> {
    try {
      // First check if it is suspended
      try {
        const status = yaml.load(
          await this.driver.get(`workspaces/${workspaceId}/status.yml`)
        ) as Prismeai.SuspendedWorkspace['payload'];
        if (status.suspended) {
          this.workspaces[workspaceId] = await Workspace.create(
            {} as Prismeai.Workspace,
            undefined as any
          );
          this.workspaces[workspaceId].status = status;
          return status as any as Prismeai.Workspace;
        }
      } catch {}

      const raw = await this.driver.get(
        `workspaces/${workspaceId}/versions/current/runtime.yml`
      );
      const dsul = yaml.load(raw) as Prismeai.RuntimeModel;
      // Stored id might not be true in case of a duplicated workspace
      await this.loadWorkspace({ ...dsul, id: workspaceId });

      return dsul;
    } catch (err) {
      if (err instanceof ObjectNotFoundError) {
        throw new ObjectNotFoundError(`Workspace not found`, { workspaceId });
      }
      throw err;
    }
  }

  private async loadWorkspace(workspace: Prismeai.RuntimeModel) {
    this.workspaces[workspace.id!] = await Workspace.create(
      workspace,
      this.apps
    );

    // Check imported apps & update watched app current versions
    if (workspace.imports) {
      this.watchAppCurrentVersions(this.workspaces[workspace.id!]);
    }
    return this.workspaces[workspace.id!];
  }

  async saveWorkspace(workspace: Prismeai.RuntimeModel) {
    await this.driver.save(
      `workspaces/${workspace.id}/versions/current/runtime.yml`,
      yaml.dump(workspace)
    );
  }
}
