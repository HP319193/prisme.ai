import { nanoid } from 'nanoid';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import DSULStorage from '../../DSULStorage';
import { AccessManager, SubjectType } from '../../../permissions';
import AppInstances from './appInstances';
import Apps from '../../apps/crud/apps';
import Automations from './automations';
import {
  Diffs,
  DiffType,
  getObjectsDifferences,
} from '../../../utils/getObjectsDifferences';
import { extractObjectsByPath } from '../../../utils/extractObjectsByPath';

interface DSULDiff {
  type: DiffType;
  path: string[];
  parentKey: string;
  diffs: Diffs;
  value: any;
  oldValue?: any;
  root: Prismeai.DSUL;
  oldRoot: Prismeai.DSUL;
}
interface DSULDiffHandler {
  path: string;
  handler: (diffs: DSULDiff[]) => Promise<any>;
}

class Workspaces {
  private accessManager: Required<AccessManager>;
  private apps: Apps;
  private broker: Broker;
  private storage: DSULStorage;
  public automations: Automations;
  public appInstances: AppInstances;

  private diffHandlers: DSULDiffHandler[];

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

    this.diffHandlers = [
      {
        path: 'imports.*',
        handler: async (allDiffs: DSULDiff[]) => {
          console.log('===> ', allDiffs);
          for (let { type, value, oldValue, root } of allDiffs) {
            const appInstance = value as Prismeai.AppInstance;
            switch (type) {
              case DiffType.ValueCreated:
                await this.appInstances.installApp(
                  // Rebuild current dsul without the installed app to prevent installApp from throwing an AlreadyUsedError
                  {
                    ...root,
                    imports: (root?.imports || []).filter(
                      (cur) => cur != appInstance
                    ),
                  },
                  appInstance
                );
                break;
              case DiffType.ValueUpdated:
                await this.appInstances.configureApp(
                  // Rebuild current dsul without the configured app to prevent configureApp from throwing an AlreadyUsedError
                  {
                    ...root,
                    imports: (root?.imports || []).map((cur) =>
                      cur != appInstance ? cur : oldValue
                    ),
                  },
                  oldValue?.slug || appInstance.slug,
                  appInstance
                );
                break;
              case DiffType.ValueDeleted:
                await this.appInstances.uninstallApp(
                  // Rebuild current dsul with the removed app to prevent deleteAutomation from throwing an ObjectNotFoundError
                  {
                    ...root,
                    imports: [...(root?.imports || []), appInstance],
                  },
                  appInstance.slug
                );
                break;
            }
          }
        },
      },
      {
        path: 'automations.*',
        handler: async (allDiffs: DSULDiff[]) => {
          for (let {
            type,
            value,
            root,
            parentKey: automationSlug,
          } of allDiffs) {
            const automation = value as Prismeai.Automation;
            switch (type) {
              case DiffType.ValueCreated:
                await this.automations.createAutomation(
                  root,
                  automation,
                  automationSlug
                );
                break;
              case DiffType.ValueUpdated:
                await this.automations.updateAutomation(
                  root,
                  automationSlug,
                  automation
                );
                break;
              case DiffType.ValueDeleted:
                await this.automations.deleteAutomation(
                  // Rebuild current dsul with the removed automation to prevent deleteAutomation from throwing an ObjectNotFoundError
                  {
                    ...root,
                    automations: {
                      ...root?.automations,
                      [automationSlug]: automation,
                    },
                  },
                  automationSlug
                );
                break;
            }
          }
        },
      },
    ];
  }

  /*
   * Workspaces
   */

  createWorkspace = async (workspace: Prismeai.Workspace) => {
    await this.processEveryDiffs({} as any, workspace);

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
    const currentDSUL = await this.getWorkspace(workspaceId);
    const dsulDiffs = await this.processEveryDiffs(currentDSUL, workspace);
    if (!dsulDiffs.length) {
      return workspace;
    }
    await this.save(workspaceId, workspace);
    this.broker.send<Prismeai.UpdatedWorkspace['payload']>(
      EventType.UpdatedWorkspace,
      {
        workspace,
      }
    );
    return workspace;
  };

  private async processEveryDiffs(
    oldDSUL: Prismeai.DSUL,
    newDSUL: Prismeai.DSUL
  ) {
    let allDsulDiffs: DSULDiff[] = [];
    const diffs = getObjectsDifferences(oldDSUL, newDSUL);
    for (let { path, handler } of this.diffHandlers) {
      const diffsPath = path.split('.').flatMap((key) => ['data', key]);
      const currentDiffs = extractObjectsByPath(diffs, diffsPath).filter(
        ({ value }) => value.__type !== DiffType.ValueUnchanged
      );

      const dsulDiffs: DSULDiff[] = currentDiffs.map(
        ({ lastKey, path, value }) => {
          const sourcePath = path.filter((cur, idx) => idx % 2 === 1); // Rebuild source path without diffs 'data' fields
          return {
            type: value.__type,
            parentKey: lastKey,
            path: sourcePath,
            diffs: value,
            root: newDSUL,
            oldRoot: oldDSUL,
            value: extractObjectsByPath(
              value.__type === DiffType.ValueDeleted ? oldDSUL : newDSUL,
              sourcePath
            )?.[0]?.value,
            oldValue:
              value.__type !== DiffType.ValueUpdated
                ? undefined
                : extractObjectsByPath(oldDSUL, sourcePath)?.[0]?.value,
          };
        }
      );

      await handler(dsulDiffs);
      allDsulDiffs.push(...dsulDiffs);
    }
    return allDsulDiffs;
  }

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
