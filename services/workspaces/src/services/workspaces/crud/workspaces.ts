import { nanoid } from 'nanoid';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import DSULStorage from '../../DSULStorage';
import { AccessManager, SubjectType } from '../../../permissions';
import AppInstances from './appInstances';
import Apps from '../../apps/crud/apps';
import Automations from './automations';

class Workspaces {
  private accessManager: Required<AccessManager>;
  private apps: Apps;
  private broker: Broker;
  private storage: DSULStorage;
  public automations: Automations;
  public appInstances: AppInstances;

  constructor(
    accessManager: Required<AccessManager>,
    apps: Apps,
    broker: Broker,
    storage: DSULStorage
  ) {
    this.accessManager = accessManager;
    this.apps = apps;
    this.broker = broker;
    this.storage = storage;
    this.automations = new Automations(this, broker);
    this.appInstances = new AppInstances(this, this.apps, broker);
  }

  /*
   * Workspaces
   */

  createWorkspace = async (workspace: Prismeai.Workspace) => {
    await this.accessManager.create(SubjectType.Workspace, {
      id: workspace.id,
      name: workspace.name,
    });
    await this.storage.save(workspace.id || nanoid(7), workspace);
    this.broker.send<Prismeai.CreatedWorkspace['payload']>(
      EventType.CreatedWorkspace,
      {
        workspace,
      }
    );
    return workspace;
  };

  getWorkspace = async (workspaceId: string) => {
    await this.accessManager.get(SubjectType.Workspace, workspaceId);
    return await this.storage.get(workspaceId);
  };

  save = async (workspaceId: string, workspace: Prismeai.Workspace) => {
    await this.accessManager.update(SubjectType.Workspace, {
      id: workspaceId,
      name: workspace.name,
    });
    await this.storage.save(workspaceId, workspace);
  };

  updateWorkspace = async (
    workspaceId: string,
    workspace: Prismeai.Workspace
  ) => {
    await this.save(workspaceId, workspace);
    this.broker.send<Prismeai.UpdatedWorkspace['payload']>(
      EventType.UpdatedWorkspace,
      {
        workspace,
      }
    );
    return workspace;
  };

  deleteWorkspace = async (
    workspaceId: PrismeaiAPI.DeleteWorkspace.PathParameters['workspaceId']
  ) => {
    await this.accessManager.delete(SubjectType.Workspace, workspaceId);
    await this.storage.delete(workspaceId);
    this.broker.send<Prismeai.DeletedWorkspace['payload']>(
      EventType.DeletedWorkspace,
      {
        workspaceId,
      }
    );
    return { id: workspaceId };
  };
}

export default Workspaces;
