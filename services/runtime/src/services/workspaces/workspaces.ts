import yaml from 'js-yaml';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../eda';
import { ObjectNotFoundError } from '../../errors';
import Storage from '../../storage';
import { DriverType } from '../../storage/types';
import { Workspace } from './workspace';
import { Apps } from '../apps';

export * from './workspace';

export class Workspaces extends Storage {
  private broker: Broker;
  private apps: Apps;
  private workspaces: Record<string, Workspace>;

  constructor(driverType: DriverType, apps: Apps, broker: Broker) {
    super(driverType);
    this.workspaces = {};
    this.apps = apps;
    this.broker = broker;
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
    ];

    this.broker.on(
      listenedEvents,
      async (event, broker, { logger }) => {
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
            delete this.workspaces[workspaceId];
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
            break;
          case EventType.UninstalledApp:
            const uninstalledAppInstanceSlug = (
              event as any as Prismeai.UninstalledAppInstance
            ).payload.slug;
            workspace.deleteAutomation(uninstalledAppInstanceSlug);
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

  async fetchWorkspace(workspaceId: string): Promise<Prismeai.Workspace> {
    try {
      const raw = await this.driver.get(
        `workspaces/${workspaceId}/current.yml`
      );
      const dsul = yaml.load(raw) as Prismeai.Workspace;
      this.workspaces[workspaceId] = new Workspace(dsul, this.apps);
      return dsul;
    } catch (err) {
      if (err instanceof ObjectNotFoundError) {
        throw new ObjectNotFoundError(`Workspace not found`, { workspaceId });
      }
      throw err;
    }
  }
}
