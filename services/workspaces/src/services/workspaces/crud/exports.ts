import stream from 'stream';
import yaml from 'js-yaml';
import { parse, basename } from 'path';
import { EventType } from '../../../eda';
import { PrismeError } from '../../../errors';
import {
  AccessManager,
  SubjectType,
  getSuperAdmin,
} from '../../../permissions';
import { DsulCrud } from './types';
import { Apps } from '../../apps';
import archiver from 'archiver';
import {
  DSULFolders,
  DSULRootFiles,
  DSULStorage,
  DSULType,
  FolderIndex,
  ImportConfig,
} from '../../DSULStorage';
import { getArchiveEntries } from '../../../utils/processArchive';
import { streamToBuffer } from '../../../utils/streamToBuffer';
import AppInstances from './appInstances';
import { Security } from './security';
import Automations from './automations';
import { Workspaces } from './workspaces';
import { Broker } from '@prisme.ai/broker';
import { Logger } from '../../../logger';
import { IMPORT_BATCH_SIZE } from '../../../../config';

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

export class WorkspaceExports extends DsulCrud {
  private workspaces: Workspaces;

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    storage: DSULStorage,
    workspaces: Workspaces,
    logger?: Logger
  ) {
    super(accessManager, broker, storage, logger, true);
    this.workspaces = workspaces;
  }

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
    parentArchive.pipe(outStream as any as NodeJS.WritableStream);

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

    // Prepare import config (i.e with published app details & any other information that might be needed during import)
    const existingApps = await this.accessManager.findAll(SubjectType.App, {
      workspaceId: workspaceId,
    });
    let importConfig: ImportConfig = {};
    if (existingApps?.length) {
      importConfig.app = {
        slug: existingApps[0].slug,
        name: existingApps[0].name,
        description: existingApps[0].description,
      };
    }
    await this.storage.save(
      { workspaceId, dsulType: DSULType.ImportConfig },
      importConfig
    );

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
        ? await this.workspaces.getWorkspace(workspaceId)
        : await this.workspaces.createWorkspace({ name: 'Import' });
      const updatedDetailedWorkspace = await this.importDSUL(
        target.id,
        'current',
        archive,
        {
          exclude: workspaceId
            ? Object.values(target?.repositories || {}).find(
                (cur) => cur.type === 'archive'
              )?.pull?.exclude
            : undefined,
        }
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

  public importDSUL = async (
    workspaceId: string,
    version: string,
    zipBuffer: Buffer | stream.Readable,
    opts?: {
      overwriteWorkspaceSlug?: boolean;
      overwriteWorkspaceSlugIfAvailable?: boolean;
      removeAdditionalFiles?: boolean;
      sourceVersion?: Prismeai.WorkspaceVersion;
      publishApp?: boolean; // If  given archive has a .import.yml indicating app settings, this is true by default
      exclude?: Required<Prismeai.WorkspaceRepository>['pull']['exclude'];
    }
  ) => {
    const workspace = await this.workspaces.getDetailedWorkspace(
      workspaceId,
      version,
      true
    );

    // For repositories pull, prepare exclusion list
    const importOpts = {
      exclude: opts?.exclude,
    };

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
      } else if (parse(splittedPath[0] || '').name === DSULType.ImportConfig) {
        filename = DSULType.ImportConfig;
      }
      return { ...entries, [filename]: stream };
    }, {});
    if (Object.keys(dsulStreams).length > 5000) {
      throw new PrismeError(
        'Workspace archive cannot have more than 5000 files',
        {}
      );
    }

    let importConfig: ImportConfig = {};
    if (dsulStreams[DSULType.ImportConfig]) {
      const buffer = await streamToBuffer(dsulStreams[DSULType.ImportConfig]);
      importConfig = yaml.load(buffer.toString()) as ImportConfig;
      delete dsulStreams[DSULType.ImportConfig];
    }

    let imported: string[] = [];
    let errors: any[] = [];
    // First load index before other files
    if (
      dsulStreams[DSULType.DSULIndex] &&
      !(importOpts?.exclude || []).some((cur) => cur.path === 'index')
    ) {
      try {
        const buffer = await streamToBuffer(dsulStreams[DSULType.DSULIndex]);
        delete dsulStreams[DSULType.DSULIndex];
        const index: any = yaml.load(buffer.toString());

        // Check for new workspace slug availability & keep old one if it's already used
        if (
          opts?.overwriteWorkspaceSlugIfAvailable &&
          index.slug &&
          index.slug != workspace.slug
        ) {
          const superAdmin = await getSuperAdmin(
            this.accessManager as AccessManager
          );
          const conflictingWorkspaces = await superAdmin.findAll(
            SubjectType.Workspace,
            {
              slug: index.slug,
            }
          );

          const conflictingWorkspace = conflictingWorkspaces.find(
            (cur) => cur.slug === index.slug && cur.id !== workspaceId
          );
          if (conflictingWorkspace) {
            // If some other workspace already uses this slug, keep our current slug
            errors.push({
              msg: `Could not rename workspace slug from ${workspace.slug} to ${index.slug} as it is already used by workspaceId ${conflictingWorkspace.id}`,
              err: 'SlugAlreadyInUse',
              slug: index.slug,
              conflictingWorkspaceId: conflictingWorkspace.id,
            });
            delete index.slug;
          }
        }

        if (
          (opts?.overwriteWorkspaceSlug ||
            opts?.overwriteWorkspaceSlugIfAvailable) &&
          index.slug
        ) {
          workspace.slug = index.slug;
        }
        const applied = await this.applyDSULFile(
          [DSULType.DSULIndex],
          workspace,
          index,
          automations,
          imports,
          security,
          importOpts
        );
        if (applied) {
          imported.push(DSULType.DSULIndex);
        }
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
    let batch: Promise<void>[] = [];
    for (let [filepath, stream] of Object.entries(dsulStreams)) {
      const splittedPath = filepath.split('/').slice(1);
      if (
        splittedPath?.[1] &&
        parse(splittedPath[1] || '').name === FolderIndex
      ) {
        // Ignore folder indexes as we will rebuild them at the end
        continue;
      }
      const savePromise = new Promise<void>(async (resolve) => {
        try {
          const buffer = await streamToBuffer(stream);
          const content: any = yaml.load(buffer.toString());
          const applied = await this.applyDSULFile(
            splittedPath,
            workspace,
            content,
            automations,
            imports,
            security,
            importOpts
          );
          if (applied) {
            imported.push(splittedPath.join('/'));
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

    // If deleteAdditionalFiles, find & delete from workspace storage any files that was present in given archive
    let deletedFiles: string[] | undefined;
    if (opts?.removeAdditionalFiles) {
      const workspaceFiles = await this.storage.find({
        workspaceId,
        version: 'current',
        parentFolder: true,
      });
      const archiveFiles = new Set(imported);
      deletedFiles = workspaceFiles
        .filter(
          ({ key }) =>
            // Never delete root files (index.yml or security.yml)
            !DSULRootFiles.find((cur) => key.startsWith(cur)) &&
            // Do not delete either folders indexes
            !key.endsWith(`${FolderIndex}.yml`) &&
            !archiveFiles.has(key)
        )
        .map(({ key }) => key);

      if (deletedFiles.length) {
        const isDeleted = await Promise.all(
          deletedFiles.map(async (cur) => {
            return await this.applyDSULFile(
              cur.split('/'),
              workspace,
              null,
              automations,
              imports,
              security,
              importOpts
            );
          })
        );
        deletedFiles = deletedFiles.filter((_, idx) => isDeleted[idx]);
      }
    }

    // Update automations, pages & import indexes
    try {
      await Promise.all([
        this.storage.refreshFolderIndex(workspaceId, DSULType.Pages),
        this.storage.refreshFolderIndex(workspaceId, DSULType.Automations),
        this.storage.refreshFolderIndex(workspaceId, DSULType.Imports),
      ]);
    } catch (err) {
      errors.push({
        msg: 'Could not refresh some dsul index. Some pages or automations might not appear in studio menus',
        err,
      });
    }

    // Finally, publish the app if it is an app
    if (
      opts?.publishApp === true ||
      (importConfig?.app?.slug && opts?.publishApp !== false)
    ) {
      try {
        await apps.publishApp(
          {
            workspaceId: workspaceId,
            slug: importConfig?.app?.slug || workspace.slug,
            description: importConfig?.app?.description,
            name: importConfig?.app?.name,
          },
          {
            description: 'Imported app release',
          },
          true
        );
      } catch (err) {
        errors.push({
          msg: 'Could not publish app',
          err,
        });
      }
    }

    const updatedDetailedWorkspace = await this.workspaces.getDetailedWorkspace(
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
        deleted: deletedFiles,
        version: opts?.sourceVersion,
        errors,
      },
      { workspaceId }
    );
    return {
      imported,
      errors,
      deleted: deletedFiles,
      workspace: updatedDetailedWorkspace,
    };
  };

  private async applyDSULFile(
    path: string[],
    workspace: Prismeai.DSULReadOnly,
    content: any | null, // Can be set to null to delete the file
    automations: Automations,
    appInstances: AppInstances,
    security: Security,
    opts?: {
      exclude?: Required<Prismeai.WorkspaceRepository>['pull']['exclude'];
    }
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

    const exclusionPath = subfileSlug
      ? `${folderName}/${subfileSlug}`
      : folderName;
    const isExcluded =
      opts?.exclude && opts.exclude.find((cur) => cur.path === exclusionPath);
    if (isExcluded) {
      return false;
    }

    switch (folderName) {
      case DSULType.DSULIndex:
        await this.workspaces.updateWorkspace(workspace.id!, {
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
          customDomains: [],
          repositories: workspace.repositories,
        });
        break;

      case DSULType.Security:
        if (security) {
          // We do not let deleting this file
          await security.updateSecurity(workspace.id!, content);
        }
        break;

      case DSULFolders.Pages:
        if (content == null) {
          await this.workspaces.pages.deletePage(workspace.id!, subfileSlug);
        } else {
          const oldSlug =
            Object.entries(workspace.pages || {}).find(
              ([key, pageMeta]) => pageMeta.id === content.id
            )?.[0] || '';
          if (!content.slug) {
            content.slug = subfileSlug;
          }
          // Use upsert method as we would otherwise reject MongoDB duplicate key error in case of unsynchronization between db & dsul
          await this.workspaces.pages.updatePage(
            workspace.id!,
            oldSlug || content.slug || subfileSlug,
            content,
            {
              upsert: true,
            }
          );
        }
        break;

      case DSULFolders.Automations:
        if (content == null) {
          await automations.deleteAutomation(workspace.id!, subfileSlug);
        } else {
          if (!content.slug) {
            content.slug = subfileSlug;
          }
          await automations.updateAutomation(
            workspace.id!,
            content.slug || subfileSlug,
            content,
            {
              // avoid any update error in case of corrupted dsul
              upsert: true,
            }
          );
        }
        break;

      case DSULFolders.Imports:
        if (content == null) {
          await appInstances.uninstallApp(workspace.id!, subfileSlug);
        } else {
          if (content.slug in (workspace.imports || {})) {
            await appInstances.configureApp(
              workspace.id!,
              content.slug,
              content
            );
          } else {
            content.slug = subfileSlug;
            await appInstances.installApp(workspace.id!, content, true); // Ignore unknown app errors as it might be imported later on
          }
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
          target = await this.workspaces.createWorkspace({
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
            publishApp: false, // We will publish ourselves just after this
          }
        );
        allImported = allImported.concat(
          imported.map((path) => `${fromWorkspaceId}/${path}`)
        );
        allErrors = allErrors.concat(errors);

        if (publishApp) {
          publishApp.workspaceId = target.id;
          await apps.publishApp(
            publishApp,
            {
              description: 'Imported app release',
            },
            true
          );
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
    this.logger.info({
      msg: 'Terminated bulk import',
      result,
    });
    return result;
  };
}
