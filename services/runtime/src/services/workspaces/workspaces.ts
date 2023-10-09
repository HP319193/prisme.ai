import yaml from 'js-yaml';
import { parse } from 'path';
import { Broker, PrismeEvent } from '@prisme.ai/broker';
import { EventType } from '../../eda';
import { ObjectNotFoundError, SuspendedWorkspaceError } from '../../errors';
import Storage, { StorageOptions } from '../../storage';
import { DriverType } from '../../storage/types';
import { Workspace } from './workspace';
import { Apps } from '../apps';
import { logger } from '../../logger';
import { AccessManager, SubjectType, getSuperAdmin } from '../../permissions';

export * from './workspace';

export class Workspaces extends Storage {
  private broker: Broker;
  private apps: Apps;
  private accessManager: AccessManager;
  private workspaces: Record<string, Workspace>;
  private watchedApps: Record<string, string[]>;
  public workspacesRegistry: Record<
    string,
    {
      id: string;
      name: string;
    }
  >;

  constructor(
    driverType: DriverType,
    driverOptions: StorageOptions[DriverType],
    apps: Apps,
    broker: Broker,
    accessManager: AccessManager
  ) {
    super(driverType, driverOptions);
    this.workspaces = {};
    this.apps = apps;
    this.broker = broker;
    this.watchedApps = {};
    this.workspacesRegistry = {};
    this.accessManager = accessManager;
  }

  startLiveUpdates() {
    this.loadWorkspacesRegistry();
    const onceListenedEvents = [
      EventType.CreatedWorkspace,
      EventType.UpdatedWorkspace,
      EventType.ConfiguredWorkspace,
      EventType.ImportedWorkspace,
      EventType.DeletedWorkspace,
      EventType.CreatedAutomation,
      EventType.UpdatedAutomation,
      EventType.DeletedAutomation,
      EventType.InstalledApp,
      EventType.UninstalledApp,
      EventType.ConfiguredApp,
    ];
    this.broker.on(onceListenedEvents, async (event, broker, { logger }) => {
      if (event.type === EventType.CreatedWorkspace) {
        const workspace = (event as any as Prismeai.CreatedWorkspace).payload
          .workspace;
        await this.loadWorkspace(workspace);
        await this.saveWorkspace(workspace, event?.source?.correlationId);
        return true;
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
          await this.saveWorkspace(workspace, event?.source?.correlationId);
        }
      }
      const workspace = this.workspaces[workspaceId];

      logger.info({
        msg: 'Received an updated workspace through events',
        event,
      });
      const updatedWorkspace = await this.applyWorkspaceEvent(workspace, event);

      await this.saveWorkspace(
        updatedWorkspace.dsul,
        event?.source?.correlationId
      );
      logger.info({
        msg: 'Persisted updated runtime.yml',
        workspaceId: workspace.id,
      });
      return true;
    });

    const alwaysListenedEvents = [
      EventType.PublishedApp,
      EventType.SuspendedWorkspace,
      EventType.RollbackWorkspaceVersion,
      EventType.UpdatedRuntimeDSUL,
    ];
    this.broker.on(
      onceListenedEvents.concat(alwaysListenedEvents),
      async (event, _, { logger }) => {
        // Handle update events to keep model updated in real-time but do not persist
        if (onceListenedEvents.includes(event.type as any)) {
          const workspaceId = event.source.workspaceId;
          if (!workspaceId) {
            return true;
          }
          if (!(workspaceId in this.workspaces)) {
            try {
              await this.fetchWorkspace(workspaceId);
            } catch (error) {
              return true;
            }
          }
          const workspace = this.workspaces[workspaceId];
          await this.applyWorkspaceEvent(workspace, event);
          if (!alwaysListenedEvents.includes(event.type as any)) {
            return true;
          }
        }

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
        } else if (event.type === EventType.RollbackWorkspaceVersion) {
          const { workspaceId } = (event as any as Prismeai.PrismeEvent).source;
          await this.fetchWorkspace(workspaceId!);
        } else if (event.type === EventType.PublishedApp) {
          const publishedPayload = (event as any as Prismeai.PublishedApp)
            .payload;
          const publishedApp = publishedPayload.app;
          if (publishedPayload.rebuildModel) {
            const rebuilt = await this.rebuildWorkspaceDSUL(
              `workspaces/${publishedApp.workspaceId!}/versions/current`
            );
            await this.apps.saveAppDSUL(
              publishedApp.slug,
              'current',
              rebuilt.dsul
            );
          } else {
            await this.apps.fetchApp(publishedApp.slug, 'current');
          }

          if (publishedApp.slug && publishedApp.slug in this.watchedApps) {
            const updateWorkspaceIds = this.watchedApps[publishedApp.slug];
            updateWorkspaceIds.map((workspaceId) =>
              this.fetchWorkspace(workspaceId)
            );
          }
        } else if (event.type === EventType.UpdatedRuntimeDSUL) {
          await this.fetchWorkspace(
            (event as Prismeai.UpdatedRuntimeDSUL).payload.workspaceId
          );
        }

        return true;
      },
      {
        GroupPartitions: false, // Every instance must be notified
      }
    );
  }

  async applyWorkspaceEvent(
    workspace: Workspace,
    event: PrismeEvent
  ): Promise<Workspace> {
    switch (event.type) {
      case EventType.DeletedWorkspace:
        // TODO better way to enforce this is executed after runtime processEvent
        setTimeout(() => {
          delete this.workspaces[workspace.id];
        }, 5000);
        break;
      case EventType.UpdatedWorkspace:
        const {
          payload: { workspace: updatedDSUL, oldSlug: oldWorkspaceSlug },
        } = event as any as Prismeai.UpdatedWorkspace;
        workspace.dsul = {
          ...workspace.dsul,
          ...updatedDSUL,
        };
        workspace.name = updatedDSUL.name;
        this.updateWorkspacesRegistry(updatedDSUL, oldWorkspaceSlug);
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
        const deletedAutomation = (event as any as Prismeai.DeletedAutomation)
          .payload.automationSlug;
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
      case EventType.ImportedWorkspace:
        const importPayload =
          event.payload as Prismeai.ImportedWorkspace['payload'];
        const rebuiltWorkspace = await new Promise<Workspace | undefined>(
          (resolve) => {
            setTimeout(async () => {
              try {
                const rebuilt = await this.rebuildWorkspaceDSUL(
                  `workspaces/${importPayload.workspace.id!}/versions/current`
                );
                resolve(rebuilt);
              } catch (err) {
                console.error({
                  msg: 'Could not rebuild workspace DSUL after an import. This workspace might not function correctly.',
                  err,
                });
              }
              resolve(undefined);
            }, 500); // Wait 500ms for other replicas to finish writting previous events & avoid any conflict that could overwrite our rebuilt model
          }
        );
        if (rebuiltWorkspace) {
          return rebuiltWorkspace;
        }
        break;
    }
    return workspace;
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

  async loadWorkspacesRegistry() {
    try {
      const superAdmin = await getSuperAdmin(this.accessManager);
      const workspacesRegistry = await superAdmin.findAll(
        SubjectType.Workspace,
        {
          registerWorkspace: true,
        }
      );
      this.workspacesRegistry = workspacesRegistry.reduce(
        (workspacesRegistry, cur) => ({
          ...workspacesRegistry,
          [cur.slug!]: {
            id: cur.id,
            name: cur.name,
          },
        }),
        {}
      );
    } catch (err) {
      logger.warn({
        msg: 'Could not load workspaces registry',
        err,
      });
    }
  }

  updateWorkspacesRegistry(dsul: Prismeai.RuntimeModel, oldSlug?: string) {
    const isPublic = !!dsul.registerWorkspace;
    if (
      isPublic &&
      (!(dsul.slug! in this.workspacesRegistry) ||
        this.workspacesRegistry[dsul.slug!].id !== dsul.id)
    ) {
      this.workspacesRegistry[dsul.slug!] = {
        id: dsul.id!,
        name: dsul.name,
      };
    } else if (!isPublic && dsul.slug! in this.workspacesRegistry) {
      delete this.workspacesRegistry[dsul.slug!];
    }

    if (oldSlug) {
      delete this.workspacesRegistry[oldSlug];
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

    this.updateWorkspacesRegistry(workspace);
    return this.workspaces[workspace.id!];
  }

  async saveWorkspace(
    workspace: Prismeai.RuntimeModel,
    correlationId?: string
  ) {
    await this.driver.save(
      `workspaces/${workspace.id}/versions/current/runtime.yml`,
      yaml.dump(workspace)
    );
    await this.broker.send<Prismeai.UpdatedRuntimeDSUL['payload']>(
      EventType.UpdatedRuntimeDSUL,
      {
        workspaceId: workspace.id!,
      },
      {
        workspaceId: workspace.id!,
        correlationId,
      }
    );
  }

  async rebuildWorkspaceDSUL(rootPath: string) {
    const automationsDirectory = `${rootPath}/automations`;
    const importsDirectory = `${rootPath}/imports`;
    const [workspaceIndexRaw, automationFiles, importFiles] = await Promise.all(
      [
        this.driver.get(`${rootPath}/index.yml`),
        this.driver.find(automationsDirectory).catch(() => []),
        this.driver.find(importsDirectory).catch(() => []),
      ]
    );
    const workspaceIndex = yaml.load(workspaceIndexRaw) as Prismeai.DSUL;

    const files = automationFiles
      .map(({ key }) => ({ type: 'automations', filename: key }))
      .concat(
        importFiles.map(({ key }) => ({ type: 'imports', filename: key }))
      )
      .filter(({ filename }) => filename !== '__index__.yml');

    const objects = await Promise.all(
      files.map(async ({ type, filename }) => {
        let path;
        try {
          path =
            (type === 'imports' ? importsDirectory : automationsDirectory) +
            '/' +
            filename;
          const slug = parse(filename).name;
          const raw = await this.driver.get(path);
          const data = yaml.load(raw) as object;
          return { type, slug, data };
        } catch (err) {
          logger.warn({
            msg: `Could not load/parse the following file during a model rebuild : '${path}'`,
            rootPath,
            err,
          });
          return false;
        }
      })
    );

    const dsul: Prismeai.RuntimeModel = objects.reduce<Prismeai.RuntimeModel>(
      (dsul, obj) => {
        if (!obj) {
          return dsul;
        }
        const { type, slug, data } = obj;
        if (type === 'automations') {
          dsul.automations![slug] = data as any;
        } else if (type === 'imports') {
          dsul.imports![slug] = data as any;
        }
        return dsul;
      },
      { ...workspaceIndex, automations: {}, imports: {} }
    );
    return this.loadWorkspace(dsul);
  }
}
