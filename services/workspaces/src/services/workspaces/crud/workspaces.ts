import { parse, basename } from 'path';
import { nanoid } from 'nanoid';
import stream from 'stream';
import yaml from 'js-yaml';
//@ts-ignore
import { hri } from 'human-readable-ids';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import {
  DSULType,
  DSULStorage,
  FolderIndex,
  DSULFolders,
} from '../../DSULStorage';
import {
  AccessManager,
  ActionType,
  getSuperAdmin,
  SubjectType,
  WorkspaceMetadata,
} from '../../../permissions';
import Pages from './pages';
import AppInstances from './appInstances';
import Automations from './automations';
import {
  Diffs,
  DiffType,
  getObjectsDifferences,
} from '../../../utils/getObjectsDifferences';
import { extractObjectsByPath } from '../../../utils/extractObjectsByPath';
import { logger } from '../../../logger';
import {
  AlreadyUsedError,
  InvalidSlugError,
  InvalidVersionError,
  PrismeError,
} from '../../../errors';
import { prepareNewDSULVersion } from '../../../utils/prepareNewDSULVersion';
import {
  IMPORT_BATCH_SIZE,
  INIT_WORKSPACE_SECURITY,
  SLUG_VALIDATION_REGEXP,
} from '../../../../config';
import { fetchUsers, NativeSubjectType } from '@prisme.ai/permissions';
import { getArchiveEntries } from '../../../utils/processArchive';
import { streamToBuffer } from '../../../utils/streamToBuffer';
import { Apps } from '../../apps';
import { Security } from '../..';
import archiver from 'archiver';

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

type BulkExport = {
  workspaceIds: string[];
  publishApps: {
    workspaceId: string;
    slug: string;
    name: string;
    description: Prismeai.LocalizedText;
    photo: string;
    workspaceVersion?: string;
  }[];
};
class Workspaces {
  private accessManager: Required<AccessManager>;
  private broker: Broker;
  private storage: DSULStorage<DSULType.DSULIndex>;
  public pages: Pages;

  private diffHandlers: DSULDiffHandler[];

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    storage: DSULStorage,
    enableCache?: boolean
  ) {
    this.accessManager = accessManager;
    this.broker = broker;
    this.storage = storage.child(DSULType.DSULIndex, {}, enableCache);
    this.pages = new Pages(
      this.accessManager,
      broker,
      this.storage,
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
          if (!SLUG_VALIDATION_REGEXP.test(workspaceSlug!)) {
            throw new InvalidSlugError(workspaceSlug);
          }
          await this.pages.updateWorkspacePagesMeta(
            workspace.id!,
            { workspaceSlug },
            { workspaceSlug: oldWorkspaceSlug }
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
            },
            { workspaceId: workspace.id }
          );
        },
      },
      {
        path: 'config',
        handler: async (allDiffs: DSULDiff[]) => {
          const workspace = allDiffs[0].root;
          this.broker.send<Prismeai.ConfiguredWorkspace['payload']>(
            EventType.ConfiguredWorkspace,
            {
              config: allDiffs[0].value,
              oldConfig: allDiffs[0].oldValue,
            },
            { workspaceId: workspace.id! }
          );
        },
      },

      {
        path: 'customDomains',
        handler: async (allDiffs: DSULDiff[]) => {
          if (allDiffs?.[0]?.type === DiffType.ValueUnchanged) {
            return;
          }
          const workspace = allDiffs[0].root;
          if (!workspace?.id || !workspace?.slug) {
            return;
          }
          const customDomains = allDiffs[0].value as string[];
          const oldCustomDomains = allDiffs[0].oldValue as string[];
          const superAdmin = await getSuperAdmin(
            this.accessManager as AccessManager
          );
          const conflictingWorkspaces = await superAdmin.findAll(
            SubjectType.Workspace,
            {
              id: {
                $ne: workspace.id,
              },
              customDomains: {
                $in: customDomains,
              },
            }
          );
          if (conflictingWorkspaces?.length) {
            throw new AlreadyUsedError(
              'One of the custom domains is already used by another workspace'
            );
          }

          await this.pages.updateWorkspacePagesMeta(
            workspace.id!,
            { customDomains },
            { customDomains: oldCustomDomains }
          );
        },
      },
    ];
  }

  /*
   * Workspaces
   */

  createWorkspace = async (
    workspaceBody: Prismeai.Workspace,
    emit: boolean = true
  ) => {
    const workspace: Prismeai.Workspace & { id: string; slug: string } = {
      ...workspaceBody,
      id: nanoid(7),
      slug: workspaceBody.slug || hri.random(),
    };

    this.broker.buffer(true);
    if (emit) {
      this.broker.send<Prismeai.CreatedWorkspace['payload']>(
        EventType.CreatedWorkspace,
        {
          workspace,
        },
        {
          workspaceId: workspace.id,
        }
      );
    }

    await this.accessManager.create(SubjectType.Workspace, {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug!,
    });
    await this.storage.save({ workspaceId: workspace.id }, workspace);

    try {
      const security = new Security(
        this.accessManager,
        this.broker,
        this.storage
      );
      await security.updateSecurity(workspace.id, INIT_WORKSPACE_SECURITY);
    } catch (err) {
      logger.warn({
        msg: 'Could not initialize workspace security section after its creation',
        err,
      });
    }

    // Send events
    await this.broker.flush(true);
    return workspace;
  };

  findWorkspaces = async (
    query?: PrismeaiAPI.GetWorkspaces.QueryParameters
  ) => {
    const { limit, page, labels, email, name, sort } = query || {};
    let mongoQuery: any = {};
    if (email) {
      const users = await fetchUsers({
        email,
      });
      if (!users?.length) {
        return [];
      }
      mongoQuery[`permissions.${users[0].id}`] = {
        $exists: true,
      };
    }
    if (labels) {
      mongoQuery.labels = {
        $in: labels.split(','),
      };
    }
    if (name) {
      mongoQuery['name'] = {
        $regex: name,
        $options: 'i',
      };
    }

    return await this.accessManager.findAll(SubjectType.Workspace, mongoQuery, {
      pagination: {
        limit,
        page,
      },
      sort,
    });
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
    const newWorkspace = await this.createWorkspace(
      {
        ...fromWorkspace,
        name: fromName + ' - Copie',
        labels: (fromWorkspace.labels || []).filter(
          (cur) => cur !== 'suggestions'
        ),
        description: `Copie du workspace ${fromName}`,
      },
      false
    );

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
      this.storage
        .copy(
          {
            workspaceId,
            ...automationsQuery,
          },
          {
            workspaceId: newWorkspace.id,
            ...automationsQuery,
          }
        )
        .catch(() => undefined),
      this.storage
        .copy(
          {
            workspaceId,
            ...importsQuery,
          },
          {
            workspaceId: newWorkspace.id,
            ...importsQuery,
          }
        )
        .catch(() => undefined), // Might crash if no import exist
      this.storage
        .copy(
          {
            workspaceId,
            dsulType: DSULType.RuntimeModel,
          },
          {
            workspaceId: newWorkspace.id,
            dsulType: DSULType.RuntimeModel,
          }
        )
        .catch(() => undefined),
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

    try {
      const security = new Security(
        this.accessManager,
        this.broker,
        this.storage
      );
      const sourceWorkspaceSecurity = await security.getSecurity(workspaceId);
      await security.updateSecurity(newWorkspace.id, sourceWorkspaceSecurity);
    } catch (err) {
      logger.warn({
        msg: 'Could not duplicate workspace security during workspace duplication',
        workspaceId,
        err,
      });
    }

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
    const { id: _, ...workspace } = await this.storage.get({
      workspaceId,
      version: version || 'current',
    });
    return { id: workspaceId, ...workspace };
  };

  getDetailedWorkspace = async (
    workspaceId: string,
    version?: string,
    includeImports?: boolean
  ): Promise<Prismeai.DSULReadOnly> => {
    const [workspace, automations, pages] = await Promise.all([
      this.getWorkspace(workspaceId, version),
      this.getIndex(DSULType.AutomationsIndex, workspaceId, version),
      this.getIndex(DSULType.PagesIndex, workspaceId, version),
    ]);
    let imports;
    if (includeImports) {
      imports = (await this.getIndex(
        DSULType.ImportsIndex,
        workspaceId,
        version
      )) as any;
    }
    return {
      ...workspace,
      automations: automations || {},
      pages: pages || {},
      imports,
    };
  };

  save = async (workspaceId: string, workspace: Prismeai.Workspace) => {
    const updatedWorkspaceMetadata: WorkspaceMetadata = {
      id: workspaceId,
      name: workspace.name,
      photo: workspace.photo,
      description: workspace.description,
      slug: workspace.slug || hri.random(),
      labels: workspace.labels,
      customDomains: workspace.customDomains,
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
      // Throw permissions errors !
      throw err;
    }

    await this.storage.save({ workspaceId }, workspace);
  };

  updateWorkspace = async (
    workspaceId: string,
    workspacePatch: Prismeai.Workspace
  ) => {
    const currentDSUL = await this.getWorkspace(workspaceId);
    currentDSUL.id = workspaceId;
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
      },
      { workspaceId }
    );

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

  configureWorkspace = async (
    workspaceId: string,
    partialConfig: any,
    patch: boolean = true
  ) => {
    const currentDSUL = await this.getWorkspace(workspaceId);
    const updatedWorkspace = {
      ...currentDSUL,
      config: {
        ...currentDSUL.config,
        value: {
          ...(patch ? currentDSUL.config?.value : {}),
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

    // Retrieve full version details from database
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

    // Check that target version is still available in storage
    try {
      await this.storage.get({
        workspaceId,
        version,
      });
    } catch {
      throw new InvalidVersionError(
        `Version '${version} not available anymore'`
      );
    }

    await this.accessManager.throwUnlessCan(
      ActionType.Update,
      SubjectType.Workspace,
      workspaceId
    );

    // Rollback
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
    this.broker.send<Prismeai.RollbackWorkspaceVersion['payload']>(
      EventType.RollbackWorkspaceVersion,
      {
        version: targetVersion,
      },
      { workspaceId }
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
    // Emit this early on, as a runtime bug would recreate runtime model file during azure storage deletion & prevent if from deleting non empty workspace directory
    this.broker.send<Prismeai.DeletedWorkspace['payload']>(
      EventType.DeletedWorkspace,
      {
        workspaceId,
        workspaceSlug: workspace.slug,
      },
      { workspaceId }
    );

    const superAdmin = await getSuperAdmin(this.accessManager as AccessManager);
    await superAdmin.deleteMany(NativeSubjectType.Roles as any, {
      subjectType: 'workspaces',
      subjectId: workspaceId,
    });

    // Delete workspace from storage
    try {
      await this.storage.delete({ workspaceId, parentFolder: true });
    } catch (err) {
      logger.err(err);
    }

    // Delete pages db entries
    try {
      await superAdmin.deleteMany(SubjectType.Page, {
        workspaceId,
      });
    } catch (err) {
      logger.err(err);
    }

    return { id: workspaceId };
  };

  exportMultipleWorkspaces = async (
    opts: PrismeaiAPI.ExportMultipleWorkspaces.RequestBody,
    outStream: stream.Writable
  ) => {
    const workspaces = opts?.workspaces?.query
      ? await this.accessManager.findAll(
          SubjectType.Workspace,
          opts?.workspaces?.query,
          {
            pagination: {
              limit: 1000,
              page: 0,
              ...opts?.workspaces?.pagination,
            },
          }
        )
      : [];
    let apps: Prismeai.App[] = [];
    if (opts.includeApps) {
      apps = await this.accessManager.findAll(
        SubjectType.App,
        {
          workspaceId: {
            $in: workspaces.map((cur) => cur.id),
          },
        },
        {
          pagination: {
            limit: 1000,
            page: 0,
            ...opts?.workspaces?.pagination,
          },
        }
      );
    }

    const appsManager = new Apps(this.accessManager, this.broker, this.storage);
    const appSortedByDependencyOrder =
      await appsManager.sortAppsDependencyChain(apps);

    const bulkExport: BulkExport = {
      workspaceIds: workspaces.map((cur) => cur.id),
      publishApps: appSortedByDependencyOrder.map((cur) => ({
        workspaceId: cur.workspaceId,
        slug: cur.slug,
        name: cur.name!,
        description: cur.description!,
        photo: cur.photo!,
      })),
    };

    const parentArchive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });
    parentArchive.pipe(outStream);

    parentArchive.append(JSON.stringify(bulkExport), {
      name: 'bulkExport.json',
    });

    // Start building workspace archive
    const appendWorkspaceExport = async (
      workspaceId: string,
      parentArchive: archiver.Archiver,
      filename: string
    ) => {
      const pipeStream = new stream.PassThrough();
      this.exportWorkspace(workspaceId, 'current', 'zip', pipeStream);
      parentArchive.append(pipeStream, {
        name: filename,
      });

      return new Promise((resolve, reject) => {
        pipeStream.on('close', resolve);
        pipeStream.on('end', resolve);
        pipeStream.on('error', reject);
      });
    };

    for (let workspace of workspaces) {
      await appendWorkspaceExport(
        workspace.id,
        parentArchive,
        `workspaces/${workspace.id}.zip`
      );
    }

    parentArchive.finalize();
  };

  exportWorkspace = async (
    workspaceId: string,
    version?: string,
    format?: string,
    outStream?: stream.Writable
  ) => {
    await this.getWorkspace(workspaceId, version);

    const archive = await this.storage.export(
      {
        workspaceId,
        version,
        parentFolder: true,
      },
      outStream,
      {
        format,
        exclude: [`${version}/${DSULType.RuntimeModel}.yml`, `__index__.yml`],
      }
    );

    return archive;
  };

  importArchive = async (archive: Buffer, workspaceId?: string) => {
    const entries = await getArchiveEntries(archive);
    // 1. Detect if this contains multiple workspaces/apps or just a single one
    const { workspaces, bulkExportStream } = entries.reduce(
      ({ workspaces, bulkExportStream }, { filename, stream }) => {
        if (
          filename.includes('workspaces/') &&
          filename.endsWith('.zip') &&
          !basename(filename).startsWith('.')
        ) {
          const folderNameIndex = filename.indexOf('workspaces/');
          const workspaceId = filename.slice(folderNameIndex + 11).slice(0, -4);
          return {
            workspaces: {
              ...workspaces,
              [workspaceId]: stream,
            },
            bulkExportStream,
          };
        } else if (filename.endsWith('bulkExport.json')) {
          return {
            bulkExportStream: stream,
            workspaces,
          };
        } else {
          return { workspaces, bulkExportStream };
        }
      },
      { workspaces: {}, bulkExportStream: false as any as stream.Readable }
    );

    if (!bulkExportStream) {
      // 2. Import a single workspace
      const target = workspaceId
        ? { id: workspaceId }
        : await this.createWorkspace({ name: 'Import' });
      const updatedDetailedWorkspace = await this.importDSUL(
        target.id,
        'current',
        archive
      );
      return updatedDetailedWorkspace;
    }

    // 3. Import a bulk archive
    if (workspaceId) {
      throw new PrismeError(
        'Cant import a bulk archive to specific workspace',
        {}
      );
    }
    let bulkExport: BulkExport;
    try {
      const bulkExportContent = (
        await streamToBuffer(bulkExportStream)
      ).toString();
      bulkExport = JSON.parse(bulkExportContent) as BulkExport;
    } catch (err) {
      throw new PrismeError(`Could not parse bulkExport.json file`, {
        type: (<any>err).type,
        err: (<any>err).message,
      });
    }
    // Take bulkExport.publishApps order into account during workspaces import & publish
    const allAppWorkspaceIds = new Set(
      (bulkExport.publishApps || []).map((cur) => cur.workspaceId)
    );
    const sortedWorkspaceIds = (bulkExport.publishApps || [])
      .map((cur) => {
        if (!(cur.workspaceId in workspaces)) {
          throw new PrismeError(
            `Workspace ${cur.workspaceId} specified by bulkExport.json missing from workspaces/ folder`,
            { workspaceId: cur.workspaceId }
          );
        }
        return cur.workspaceId;
      })
      .concat(
        Object.keys(workspaces).filter(
          (workspaceId) => !allAppWorkspaceIds.has(workspaceId)
        )
      );

    const {
      imported: importedWorkspaceFiles,
      errors: workspaceErrors,
      createdWorkspaceIds,
      updatedWorkspaceIds,
      publishedApps,
    } = await this.importMultipleWorkspaces(
      sortedWorkspaceIds.map((workspaceId) => ({
        workspaceId,
        stream: (<any>workspaces)[workspaceId] as stream.Readable,
        publishApp: allAppWorkspaceIds.has(workspaceId)
          ? (bulkExport.publishApps || []).find(
              (cur) => cur.workspaceId == workspaceId
            )
          : undefined,
      }))
    );

    return {
      createdWorkspaceIds,
      updatedWorkspaceIds,
      errors: workspaceErrors,
      imported: importedWorkspaceFiles,
      publishedApps,
    };
  };

  private importDSUL = async (
    workspaceId: string,
    version: string,
    zipBuffer: Buffer,
    opts?: { overwriteWorkspaceSlug?: boolean }
  ) => {
    const workspace = await this.getDetailedWorkspace(
      workspaceId,
      version,
      true
    );

    const automations = new Automations(
      this.accessManager,
      this.broker.child(
        {},
        {
          // We dont want to emit automations related events, runtime will synchronize the entire model at once on the workspaces.imported event
          buffer: true,
        }
      ),
      this.storage
    );
    const apps = new Apps(this.accessManager, this.broker, this.storage);
    const imports = new AppInstances(
      this.accessManager,
      this.broker,
      this.storage,
      apps
    );
    const security = new Security(
      this.accessManager,
      this.broker,
      this.storage
    );

    const dsulStreams: Record<string, stream.Readable> = (
      await getArchiveEntries(zipBuffer)
    ).reduce((entries, { filename, stream }) => {
      if (
        !filename.endsWith('.yml') &&
        !filename.endsWith('.yaml') &&
        !filename.endsWith('.json')
      ) {
        return entries;
      }
      const splittedPath = filename.split('/').slice(1);
      if (parse(splittedPath[0] || '').name === DSULType.DSULIndex) {
        filename = DSULType.DSULIndex;
      }
      return { ...entries, [filename]: stream };
    }, {});
    if (Object.keys(dsulStreams).length > 5000) {
      throw new PrismeError(
        'Workspace archive cannot have more than 5000 files',
        {}
      );
    }

    let imported: string[] = [];
    // First load index before other files
    if (dsulStreams[DSULType.DSULIndex]) {
      try {
        const buffer = await streamToBuffer(dsulStreams[DSULType.DSULIndex]);
        delete dsulStreams[DSULType.DSULIndex];
        const index: any = yaml.load(buffer.toString());
        if (opts?.overwriteWorkspaceSlug && index.slug) {
          workspace.slug = index.slug;
        }
        await this.applyDSULFile(
          [DSULType.DSULIndex],
          workspace,
          index,
          automations,
          imports,
          security
        );
        imported.push(DSULType.DSULIndex);
      } catch (err) {
        return {
          errors: [
            {
              msg: 'Some error occured while importing a workspace archive',
              workspaceId: workspaceId,
              filepath: DSULType.DSULIndex,
              err,
            },
          ],
          imported: [],
        };
      }
    }

    // Import all other files
    let errors: any[] = [];
    let batch: Promise<void>[] = [];
    for (let [filepath, stream] of Object.entries(dsulStreams)) {
      const savePromise = new Promise<void>(async (resolve) => {
        try {
          const buffer = await streamToBuffer(stream);
          const content: any = yaml.load(buffer.toString());
          const splittedPath = filepath.split('/').slice(1);
          const applied = await this.applyDSULFile(
            splittedPath,
            workspace,
            content,
            automations,
            imports,
            security
          );
          if (applied) {
            imported.push(filepath);
          }
        } catch (err) {
          errors.push({
            msg: 'Some error occured while importing a workspace archive',
            workspaceId: workspaceId,
            filepath,
            err,
          });
        }
        resolve();
      });

      batch.push(savePromise);
      if (batch.length < IMPORT_BATCH_SIZE) {
        continue;
      }
      await Promise.all(batch);
      batch = [];
    }
    await Promise.all(batch);

    const updatedDetailedWorkspace = await this.getDetailedWorkspace(
      workspaceId,
      version,
      true
    );
    this.broker.send<Prismeai.ImportedWorkspace['payload']>(
      EventType.ImportedWorkspace,
      {
        workspace: {
          id: workspaceId,
          slug: updatedDetailedWorkspace.slug,
          name: updatedDetailedWorkspace.name,
        },
        files: imported,
      },
      { workspaceId }
    );
    return {
      imported,
      errors,
      workspace: updatedDetailedWorkspace,
    };
  };

  private async applyDSULFile(
    path: string[],
    workspace: Prismeai.DSULReadOnly,
    content: any,
    automations: Automations,
    appInstances: AppInstances,
    security: Security
  ) {
    const [folder, subfile, ...nestedPath] = path;
    let subfileSlug = parse(subfile || '').name;
    const folderName = parse(folder || '').name;
    if (
      subfileSlug === FolderIndex || // Ignore FolderIndexes
      (subfileSlug && subfile.startsWith('.')) // Ignore hidden files
    ) {
      return false;
    }

    // Pages can have / in their filenames
    if (folderName === DSULType.Pages && nestedPath.length) {
      subfileSlug = [subfile]
        .concat(nestedPath.filter(Boolean))
        .join('/')
        .replace(/\.[^/.]+$/, '');
    }

    switch (folderName) {
      case DSULType.DSULIndex:
        await this.updateWorkspace(workspace.id!, {
          ...content,
          description:
            typeof content.description === 'object'
              ? Object.entries(content.description).reduce(
                  (description, [lang, text]) => ({
                    ...description,
                    [lang]: `${text || ''} (IMPORT)`,
                  }),
                  {}
                )
              : `${content.description || ''} (IMPORT)`,
          labels: [
            ...new Set([
              ...(workspace.labels || []),
              ...(content.labels || []),
            ]),
          ],
          name: content.name,
          slug: workspace.slug,
          id: workspace.id,
        });
        break;

      case DSULType.Security:
        await security.updateSecurity(workspace.id!, content);
        break;

      case DSULFolders.Pages:
        const oldSlug =
          Object.entries(workspace.pages || {}).find(
            ([key, pageMeta]) => pageMeta.id === content.id
          )?.[0] || '';
        if (
          content.slug in (workspace.pages || {}) ||
          oldSlug in (workspace.pages || {})
        ) {
          await this.pages.updatePage(
            workspace.id!,
            oldSlug || content.slug,
            content
          );
        } else {
          content.slug = subfileSlug;
          await this.pages.createPage(workspace.id!, content);
        }
        break;

      case DSULFolders.Automations:
        if (content.slug in (workspace.automations || {})) {
          await automations.updateAutomation(
            workspace.id!,
            content.slug,
            content
          );
        } else {
          content.slug = subfileSlug;
          await automations.createAutomation(workspace.id!, content);
        }
        break;

      case DSULFolders.Imports:
        if (content.slug in (workspace.imports || {})) {
          await appInstances.configureApp(workspace.id!, content.slug, content);
        } else {
          content.slug = subfileSlug;
          await appInstances.installApp(workspace.id!, content, true); // Ignore unknown app errors as it might be imported later on
        }
        break;

      default:
        return false;
    }
    return true;
  }

  private importMultipleWorkspaces = async (
    workspaces: {
      workspaceId: string;
      stream: stream.Readable;
      publishApp?: Prismeai.App;
    }[]
  ) => {
    const apps = new Apps(this.accessManager, this.broker, this.storage);
    const superAdmin = await getSuperAdmin(this.accessManager as AccessManager);

    let allImported: string[] = [],
      allErrors: any[] = [],
      publishedApps: Prismeai.App[] = [],
      createdWorkspaceIds: string[] = [],
      updatedWorkspaceIds: string[] = [];
    for (let {
      workspaceId: fromWorkspaceId,
      stream,
      publishApp,
    } of workspaces) {
      try {
        const archive = await streamToBuffer(stream);
        const existingWorkspace = await superAdmin.findAll(
          SubjectType.Workspace,
          {
            $or: [
              {
                id: fromWorkspaceId,
              },
              {
                labels: {
                  $in: [`importFrom:${fromWorkspaceId}`],
                },
              },
            ],
          }
        );

        let target: { id: string };
        if (existingWorkspace?.[0]?.id) {
          target = { id: existingWorkspace?.[0]?.id };
          updatedWorkspaceIds.push(target.id);
        } else {
          target = await this.createWorkspace({
            name: 'Import',
            labels: [`importFrom:${fromWorkspaceId}`],
          });
          createdWorkspaceIds.push(target.id);
        }

        const { imported, errors } = await this.importDSUL(
          target.id,
          'current',
          archive,
          {
            overwriteWorkspaceSlug: true,
          }
        );
        allImported = allImported.concat(
          imported.map((path) => `${fromWorkspaceId}/${path}`)
        );
        allErrors = allErrors.concat(errors);

        if (publishApp) {
          // How can we avoid this ugly wait & make sure the runtime updated the runtime.yml with latest updates before publishing ??
          await new Promise((resolve) => setTimeout(resolve, 1000));
          publishApp.workspaceId = target.id;
          await apps.publishApp(publishApp, {
            description: 'Imported app release',
          });
          publishedApps.push(publishApp);
        }
      } catch (err) {
        allErrors.push({
          msg: 'Some error occured while importing a workspace archive',
          fromWorkspaceId,
          err,
        });
      }
    }

    const result = {
      imported: allImported,
      errors: allErrors,
      createdWorkspaceIds,
      updatedWorkspaceIds,
      publishedApps,
    };
    logger.info({
      msg: 'Terminated bulk import',
      result,
    });
    return result;
  };
}

export default Workspaces;
