import { nanoid } from 'nanoid';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import DSULStorage from '../../DSULStorage';
import { AccessManager, SubjectType } from '../../../permissions';
import AppInstances from './appInstances';
import Apps from '../../apps/crud/apps';
import Automations from './automations';
import Pages from './pages';
import {
  Diffs,
  DiffType,
  getObjectsDifferences,
} from '../../../utils/getObjectsDifferences';
import { extractObjectsByPath } from '../../../utils/extractObjectsByPath';
import { SLUG_VALIDATION_REGEXP } from '../../../../config';
import { AlreadyUsedError, InvalidSlugError } from '../../../errors';
import { ObjectNotFoundError } from '@prisme.ai/permissions';

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
  public pages: Pages;

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
    this.pages = new Pages(this.accessManager, broker);

    this.diffHandlers = [
      {
        path: 'config',
        handler: async (allDiffs: DSULDiff[]) => {
          this.broker.send<Prismeai.ConfiguredWorkspace['payload']>(
            EventType.ConfiguredWorkspace,
            {
              config: allDiffs[0].value,
            }
          );
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
      {
        path: 'imports.*',
        handler: async (allDiffs: DSULDiff[]) => {
          for (let {
            type,
            value,
            oldValue,
            root,
            parentKey: appSlug,
          } of allDiffs) {
            const appInstance = value as Prismeai.AppInstance;

            switch (type) {
              case DiffType.ValueCreated:
                // Rebuild current dsul without the installed app to prevent installApp from throwing an AlreadyUsedError
                const { [appSlug]: currentOne, ...importsWithoutCurrentOne } =
                  root.imports || {};
                await this.appInstances.installApp(
                  {
                    ...root,
                    imports: importsWithoutCurrentOne,
                  },
                  { ...appInstance, slug: appSlug }
                );
                break;
              case DiffType.ValueUpdated:
                await this.appInstances.configureApp(
                  {
                    ...root,
                    imports: {
                      ...root.imports,
                      [appSlug]: oldValue,
                    },
                  },
                  appSlug,
                  appInstance
                );
                break;
              case DiffType.ValueDeleted:
                await this.appInstances.uninstallApp(
                  {
                    ...root,
                    imports: {
                      ...(root?.imports || {}),
                      [appSlug]: appInstance,
                    },
                  },
                  appSlug
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
    this.broker.buffer(true);
    this.broker.send<Prismeai.CreatedWorkspace['payload']>(
      EventType.CreatedWorkspace,
      {
        workspace,
      }
    );

    await this.processEveryDiffs({} as any, workspace);
    await this.accessManager.create(SubjectType.Workspace, {
      id: workspace.id,
      name: workspace.name,
    });
    await this.storage.save(workspace.id || nanoid(7), workspace);

    // Send events
    await this.broker.flush(true);
    return workspace;
  };

  getWorkspace = async (workspaceId: string) => {
    try {
      const { id } = await this.accessManager.get(
        SubjectType.Workspace,
        workspaceId
      );
      return await this.storage.get(id);
    } catch (e) {
      const [workspace] = await this.accessManager.findAll(
        SubjectType.Workspace,
        {
          slug: workspaceId,
        }
      );
      if (!workspace) {
        throw new ObjectNotFoundError();
      }
      return await this.storage.get(workspace.id);
    }
  };

  save = async (workspaceId: string, workspace: Prismeai.Workspace) => {
    if (workspace.slug && !SLUG_VALIDATION_REGEXP.test(workspace.slug)) {
      throw new InvalidSlugError(workspace.slug);
    }
    try {
      await this.accessManager.update(SubjectType.Workspace, {
        id: workspaceId,
        name: workspace.name,
        photo: workspace.photo,
        description: workspace.description,
        slug: workspace.slug,
      });
    } catch (error) {
      if (
        (<any>error).message &&
        (<any>error).message.includes('duplicate key error')
      ) {
        throw new AlreadyUsedError(
          `Workspace slug '${workspace.slug}' already used`,
          {
            slug: workspace.slug,
          }
        );
      }
      throw error;
    }

    await this.storage.save(workspaceId, workspace);
  };

  updateWorkspace = async (
    workspaceId: string,
    workspace: Prismeai.Workspace
  ) => {
    this.broker.buffer(true);
    this.broker.send<Prismeai.UpdatedWorkspace['payload']>(
      EventType.UpdatedWorkspace,
      {
        workspace,
      }
    );

    const currentDSUL = await this.getWorkspace(workspaceId);
    const diffs = await this.processEveryDiffs(currentDSUL, workspace);
    if (diffs.__type === DiffType.ValueUnchanged) {
      this.broker.clear(true);
      return workspace;
    }
    await this.save(workspaceId, workspace);

    // Send events
    await this.broker.flush(true);
    return workspace;
  };

  private async processEveryDiffs(
    oldDSUL: Prismeai.DSUL,
    newDSUL: Prismeai.DSUL
  ) {
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
      if (dsulDiffs.length) {
        await handler(dsulDiffs);
      }
    }
    return diffs;
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
