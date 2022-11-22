import { nanoid } from 'nanoid';
//@ts-ignore
import { hri } from 'human-readable-ids';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import DSULStorage, { DSULType } from '../../DSULStorage';
import {
  AccessManager,
  ActionType,
  SubjectType,
  WorkspaceMetadata,
} from '../../../permissions';
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
  root: Prismeai.DSUL & { id: string };
  oldRoot: Prismeai.DSUL;
}
interface DSULDiffHandler {
  path: string;
  handler: (diffs: DSULDiff[]) => Promise<any>;
}

class Workspaces {
  private accessManager: Required<AccessManager>;
  private broker: Broker;
  private storage: DSULStorage;
  public pages: Pages;

  private diffHandlers: DSULDiffHandler[];

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    storage: DSULStorage
  ) {
    this.accessManager = accessManager;
    this.broker = broker;
    this.storage = storage;
    this.pages = new Pages(
      this.accessManager,
      broker,
      storage,
      undefined as any
    );

    this.diffHandlers = [
      {
        path: 'slug',
        handler: async (allDiffs: DSULDiff[]) => {
          if (allDiffs?.[0]?.type !== DiffType.ValueUpdated) {
            return;
          }
          const workspace = allDiffs[0].root;
          const workspaceSlug = allDiffs[0].value as string;
          const oldWorkspaceSlug = allDiffs[0].oldValue as string;
          if (!workspace?.id || !workspaceSlug) {
            return;
          }
          await this.pages.updatePagesWorkspaceSlug(
            workspace.id!,
            workspaceSlug,
            oldWorkspaceSlug
          );
        },
      },
      {
        path: 'blocks',
        handler: async (allDiffs: DSULDiff[]) => {
          const workspace = allDiffs[0].root;
          this.broker.send<Prismeai.UpdatedBlocks['payload']>(
            EventType.UpdatedBlocks,
            {
              blocks: allDiffs[0].value,
              workspaceSlug: workspace.slug!,
            }
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
    ];
  }

  /*
   * Workspaces
   */

  createWorkspace = async (workspaceBody: Prismeai.Workspace) => {
    const workspace: Prismeai.Workspace & { id: string; slug: string } = {
      ...workspaceBody,
      id: nanoid(7),
      slug: workspaceBody.slug || hri.random(),
    };

    this.broker.buffer(true);
    this.broker.send<Prismeai.CreatedWorkspace['payload']>(
      EventType.CreatedWorkspace,
      {
        workspace,
      },
      {
        workspaceId: workspace.id,
      }
    );

    await this.accessManager.create(SubjectType.Workspace, {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug!,
    });
    await this.storage.save({ workspaceId: workspace.id }, workspace);

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

  duplicateWorkspace = async (workspaceId: string, version?: string) => {
    const {
      slug: fromSlug,
      id: _,
      name: fromName,
      ...fromWorkspace
    } = await this.getWorkspace(workspaceId, version);
    const newWorkspace = await this.createWorkspace({
      ...fromWorkspace,
      name: fromName + ' - Copie',
      description: `Copie du workspace ${fromName}`,
    });

    // Copy automations & imports
    const automationsQuery = {
      version: 'current',
      parentFolder: true,
      dsulType: DSULType.Automations,
    };
    const importsQuery = {
      ...automationsQuery,
      dsulType: DSULType.Imports,
    };
    await Promise.all([
      this.storage.copy(
        {
          workspaceId,
          ...automationsQuery,
        },
        {
          workspaceId: newWorkspace.id,
          ...automationsQuery,
        }
      ),
      this.storage.copy(
        {
          workspaceId,
          ...importsQuery,
        },
        {
          workspaceId: newWorkspace.id,
          ...importsQuery,
        }
      ),
    ]);

    this.broker.send<Prismeai.DuplicatedWorkspace['payload']>(
      EventType.DuplicatedWorkspace,
      {
        workspace: newWorkspace,
        fromWorkspace: {
          name: fromName,
          slug: fromSlug!,
          id: workspaceId,
        },
      },
      {
        workspaceId: newWorkspace.id,
      }
    );

    // Duplicate pages in database
    await this.pages.duplicateWorkspacePages(workspaceId, newWorkspace.id);

    return newWorkspace;
  };

  getIndex = async <t extends DSULType>(
    dsulType: t,
    workspaceId: string,
    version?: string
  ) => {
    return this.storage.folderIndex<t>({
      dsulType,
      workspaceId,
      version,
      folderIndex: true,
    });
  };

  getWorkspaceAsAdmin = async (workspaceId: string, version?: string) => {
    return await this.storage.get({
      workspaceId,
      version: version || 'current',
    });
  };

  getDetailedWorkspace = async (
    workspaceId: string,
    version?: string
  ): Promise<Prismeai.DSULReadOnly> => {
    const [workspace, automations, pages] = await Promise.all([
      this.getWorkspace(workspaceId, version),
      this.getIndex(DSULType.AutomationsIndex, workspaceId, version),
      this.getIndex(DSULType.PagesIndex, workspaceId, version),
    ]);
    return {
      ...workspace,
      automations: automations || {},
      pages: pages || {},
    };
  };

  save = async (workspaceId: string, workspace: Prismeai.Workspace) => {
    const updatedWorkspaceMetadata: WorkspaceMetadata = {
      id: workspaceId,
      name: workspace.name,
      photo: workspace.photo,
      description: workspace.description,
      slug: workspace.slug || hri.random(),
    };

    try {
      await this.accessManager.update(
        SubjectType.Workspace,
        updatedWorkspaceMetadata
      );
    } catch (err) {
      if ((err as { code: number }).code === 11000) {
        throw new AlreadyUsedError(
          `Workspace slug '${updatedWorkspaceMetadata.slug}' is already used`,
          { slug: 'AlreadyUsedError' }
        );
      }
    }

    await this.storage.save({ workspaceId }, workspace);
  };

  updateWorkspace = async (
    workspaceId: string,
    workspacePatch: Prismeai.Workspace
  ) => {
    const currentDSUL = await this.getWorkspace(workspaceId);
    const workspace = {
      ...currentDSUL,
      ...workspacePatch,
    };

    if (!workspace.slug) {
      workspace.slug = hri.random();
    }
    this.broker.buffer(true);

    this.broker.send<Prismeai.UpdatedWorkspace['payload']>(
      EventType.UpdatedWorkspace,
      {
        workspace,
        oldSlug:
          workspace.slug && workspace.slug !== currentDSUL.slug
            ? currentDSUL.slug
            : undefined,
      }
    );

    const diffs = await this.processEveryDiffs(currentDSUL, {
      id: workspaceId,
      ...workspace,
    });
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
    versionRequest: Prismeai.WorkspaceVersion
  ): Promise<Required<Prismeai.WorkspaceVersion>> => {
    const currentVersions = await this.listWorkspaceVersions(workspaceId);
    const { newVersion, allVersions, expiredVersions } = prepareNewDSULVersion(
      currentVersions,
      versionRequest
    );

    const version: Required<Prismeai.WorkspaceVersion> = {
      ...versionRequest,
      ...newVersion,
    };
    await this.storage.copy(
      { workspaceId, parentFolder: true, version: 'current' },
      {
        workspaceId,
        version: version.name,
        parentFolder: true,
      }
    );
    await this.accessManager.update(SubjectType.Workspace, {
      id: workspaceId,
      versions: allVersions,
    });
    this.broker
      .send<Prismeai.PublishedWorkspaceVersion['payload']>(
        EventType.PublishedWorkspaceVersion,
        {
          version,
        }
      )
      .catch((err) => logger.error(err));
    (expiredVersions || [])
      .filter((cur) => cur?.name?.length && cur.name !== 'current') // an empty version would delete workspace directory
      .map(
        async (cur) =>
          await this.storage.delete({
            workspaceId,
            version: cur.name,
            parentFolder: true,
          })
      );
    return version;
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
    await this.storage.delete({ workspaceId, version, parentFolder: true });

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

  rollbackWorkspaceVersion = async (workspaceId: string, version: string) => {
    if (version == 'current') {
      throw new InvalidVersionError('Cannot rollback to current version');
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
    await this.accessManager.throwUnlessCan(
      ActionType.Update,
      SubjectType.Workspace,
      workspaceId
    );
    this.broker.send<Prismeai.RollbackWorkspaceVersion['payload']>(
      EventType.RollbackWorkspaceVersion,
      {
        version: targetVersion,
      }
    );
    await this.storage.delete({
      workspaceId,
      version: 'current',
      parentFolder: true,
    });
    await this.storage.copy(
      { workspaceId, parentFolder: true, version },
      {
        workspaceId,
        version: 'current',
        parentFolder: true,
      }
    );
    return targetVersion;
  };

  private async processEveryDiffs(
    oldDSUL: Prismeai.DSUL,
    newDSUL: Prismeai.DSUL & { id: string }
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
    const workspace = await this.getWorkspace(workspaceId);

    // Delete workspace DB entry & check permissions
    await this.accessManager.delete(SubjectType.Workspace, workspaceId);

    // Delete workspace from storage
    try {
      await this.storage.delete({ workspaceId, parentFolder: true });
    } catch (err) {
      logger.err(err);
    }

    // Delete pages db entries
    try {
      await this.accessManager.deleteMany(SubjectType.Page, {
        workspaceId,
      });
    } catch (err) {
      logger.err(err);
    }

    this.broker.send<Prismeai.DeletedWorkspace['payload']>(
      EventType.DeletedWorkspace,
      {
        workspaceId,
        workspaceSlug: workspace.slug,
      }
    );
    return { id: workspaceId };
  };
}

export default Workspaces;
