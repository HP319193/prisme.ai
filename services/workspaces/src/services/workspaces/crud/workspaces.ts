import { nanoid } from 'nanoid';
//@ts-ignore
import { hri } from 'human-readable-ids';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import DSULStorage from '../../DSULStorage';
import {
  AccessManager,
  SubjectType,
  WorkspaceMetadata,
} from '../../../permissions';
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
import { logger } from '../../../logger';
import { AlreadyUsedError, InvalidVersionError } from '../../../errors';
import { prepareNewDSULVersion } from '../../../utils/prepareNewDSULVersion';

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
    this.pages = new Pages(this, this.accessManager, broker);

    this.diffHandlers = [
      {
        path: 'slug',
        handler: async (allDiffs: DSULDiff[]) => {
          if (allDiffs?.[0]?.type !== DiffType.ValueUpdated) {
            return;
          }
          const workspace = allDiffs[0].root as Prismeai.Workspace;
          const workspaceSlug = allDiffs[0].value as string;
          if (!workspace?.id || !workspaceSlug) {
            return;
          }
          await this.pages.updatePagesWorkspaceSlug(
            workspace.id!,
            workspaceSlug
          );
        },
      },
      {
        path: 'config',
        handler: async (allDiffs: DSULDiff[]) => {
          this.broker.send<Prismeai.ConfiguredWorkspace['payload']>(
            EventType.ConfiguredWorkspace,
            {
              config: allDiffs[0].value,
              oldConfig: allDiffs[0].oldValue,
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
      {
        path: 'pages.*',
        handler: async (allDiffs: DSULDiff[]) => {
          // First find slug renaming to merge their create+delete diff into a single update
          // Without this, corresponding permission entry would be recreated from scratch (& thus emptied)
          const createdDiffs = allDiffs.filter(
            (cur) => cur.type == DiffType.ValueCreated
          );
          const removeDiffIdxs = new Set();
          for (let creation of createdDiffs) {
            const sameIdDeletion = allDiffs.findIndex(
              (cur) =>
                cur.type == DiffType.ValueDeleted &&
                cur.value.id == creation.value.id
            );
            if (sameIdDeletion !== -1) {
              removeDiffIdxs.add(sameIdDeletion);
              creation.type = DiffType.ValueUpdated;
            }
          }
          // Merge & clean
          allDiffs = allDiffs
            .map((cur, idx) => {
              if (removeDiffIdxs.has(idx)) {
                return false;
              }
              delete cur?.value?.createdAt;
              delete cur?.value?.createdBy;
              delete cur?.value?.updatedAt;
              delete cur?.value?.updatedBy;
              delete cur?.value?.permissions;
              delete cur?.value?.workspaceId;
              delete cur?.value?.workspaceSlug;
              if (cur?.value?.__migrate) {
                cur.type = DiffType.ValueUpdated;
              }
              return cur;
            })
            .filter(Boolean) as DSULDiff[];

          let deleteUnlinkedPages = false;
          for (let { type, value, root, parentKey: pageSlug } of allDiffs) {
            const page = value as Prismeai.Page;
            page.slug = pageSlug;
            switch (type) {
              case DiffType.ValueCreated:
                await this.pages.createPage(root, page);
                deleteUnlinkedPages = true;
                break;
              case DiffType.ValueUpdated:
                await this.pages.updatePage(root, { slug: pageSlug }, page);
                break;
              case DiffType.ValueDeleted:
                deleteUnlinkedPages = true;
                break;
            }
          }
          if (deleteUnlinkedPages) {
            setTimeout(async () => {
              const workspace: Prismeai.Workspace = allDiffs?.[0]
                ?.root as Prismeai.Workspace;
              const knownIds = Object.values(workspace?.pages || {})
                .map((cur) => cur.id)
                .filter(Boolean);
              if (knownIds?.length) {
                await this.pages.deleteUnlinkedPages(
                  workspace.id!,
                  knownIds as any
                );
              }
            }, 2000);
          }
        },
      },
    ];
  }

  /*
   * Workspaces
   */

  createWorkspace = async (workspace: Prismeai.Workspace) => {
    if (!workspace.slug) {
      workspace.slug = hri.random();
    }

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
      slug: workspace.slug!,
    });
    await this.storage.save(workspace.id || nanoid(7), workspace);

    // Send events
    await this.broker.flush(true);
    return workspace;
  };

  findWorkspaces = async (
    query?: PrismeaiAPI.GetWorkspaces.QueryParameters
  ) => {
    const { limit, page } = query || {};
    return await this.accessManager.findAll(
      SubjectType.Workspace,
      {},
      {
        pagination: {
          limit,
          page,
        },
      }
    );
  };

  getWorkspace = async (workspaceId: string, version?: string) => {
    const metadata = await this.accessManager.get(
      SubjectType.Workspace,
      workspaceId
    );
    if (
      version &&
      version !== 'current' &&
      !(metadata.versions || []).some((cur) => cur.name == version)
    ) {
      throw new InvalidVersionError(`Unknown version name '${version}'`);
    }
    return await this.getWorkspaceAsAdmin(workspaceId, version);
  };

  getWorkspaceAsAdmin = async (workspaceId: string, version?: string) => {
    return await this.storage.get(workspaceId, version || 'current');
  };

  save = async (
    workspaceId: string,
    workspace: Prismeai.Workspace,
    versionRequest?: Prismeai.WorkspaceVersion
  ) => {
    const updatedWorkspaceMetadata: WorkspaceMetadata = {
      id: workspaceId,
      name: workspace.name,
      photo: workspace.photo,
      description: workspace.description,
      slug: workspace.slug || hri.random(),
    };

    let deleteVersions;
    if (versionRequest) {
      const currentVersions = await this.listWorkspaceVersions(workspaceId);
      const { newVersion, allVersions, expiredVersions } =
        prepareNewDSULVersion(currentVersions, versionRequest);

      updatedWorkspaceMetadata.versions = allVersions;
      Object.assign(versionRequest, newVersion);
      deleteVersions = expiredVersions;
    }
    try {
      await this.accessManager.update(
        SubjectType.Workspace,
        updatedWorkspaceMetadata
      );
    } catch (err) {
      if ((err as { code: number }).code === 11000) {
        throw new AlreadyUsedError(
          `Workspaceslug '${updatedWorkspaceMetadata.slug}' is already used`,
          { slug: 'AlreadyUsedError' }
        );
      }
    }

    await this.storage.save(workspaceId, workspace);
    if (versionRequest) {
      await this.storage.save(workspaceId, workspace, versionRequest.name);
      this.broker
        .send<Prismeai.PublishedWorkspaceVersion['payload']>(
          EventType.PublishedWorkspaceVersion,
          {
            version: versionRequest,
          }
        )
        .catch((err) => logger.error(err));
      (deleteVersions || [])
        .filter((cur) => cur?.name?.length && cur.name !== 'current') // an empty version would delete workspace directory
        .map(async (cur) => await this.storage.delete(workspaceId, cur.name));
    }

    return versionRequest;
  };

  updateWorkspace = async (
    workspaceId: string,
    workspace: Prismeai.Workspace
  ) => {
    if (!workspace.slug) {
      workspace.slug = hri.random();
    }
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

  configureWorkspace = async (workspaceId: string, partialConfig: any) => {
    const currentDSUL = await this.getWorkspace(workspaceId);
    const updatedWorkspace = {
      ...currentDSUL,
      config: {
        ...currentDSUL.config,
        value: {
          ...currentDSUL.config?.value,
          ...partialConfig,
        },
      },
    };

    await this.updateWorkspace(workspaceId, updatedWorkspace);
    return updatedWorkspace.config;
  };

  listWorkspaceVersions = async (workspaceId: string) => {
    const workspaceMetadata = await this.accessManager.get(
      SubjectType.Workspace,
      workspaceId
    );
    return workspaceMetadata.versions || [];
  };

  publishWorkspaceVersion = async (
    workspaceId: string,
    version: Prismeai.WorkspaceVersion
  ): Promise<Required<Prismeai.WorkspaceVersion>> => {
    const currentWorkspace = await this.getWorkspace(workspaceId);
    return (await this.save(
      workspaceId,
      currentWorkspace,
      version
    )) as Required<Prismeai.WorkspaceVersion>;
  };

  deleteWorkspaceVersion = async (
    workspaceId: string,
    version: string
  ): Promise<Required<Prismeai.WorkspaceVersion>> => {
    if (version == 'current') {
      throw new InvalidVersionError('Cannot delete current version');
    }
    const workspaceMetadata = await this.accessManager.get(
      SubjectType.Workspace,
      workspaceId
    );
    const targetVersion = (workspaceMetadata.versions || []).find(
      (cur) => cur.name == version
    );
    if (!targetVersion) {
      throw new InvalidVersionError(`Unknown version name '${version}'`);
    }
    await this.accessManager.update(SubjectType.Workspace, {
      ...workspaceMetadata,
      versions: (workspaceMetadata.versions || []).filter(
        (cur) => cur.name !== version
      ),
    });
    await this.storage.delete(workspaceId, version);

    this.broker
      .send<Prismeai.DeletedWorkspaceVersion['payload']>(
        EventType.DeletedWorkspaceVersion,
        {
          version: targetVersion,
        }
      )
      .catch((err) => logger.error(err));

    return targetVersion;
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
