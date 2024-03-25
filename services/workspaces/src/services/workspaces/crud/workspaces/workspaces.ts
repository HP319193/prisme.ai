import { nanoid } from 'nanoid';
//@ts-ignore
import { hri } from 'human-readable-ids';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../../eda';
import { DSULType, DSULStorage } from '../../../DSULStorage';
import {
  AccessManager,
  ActionType,
  getSuperAdmin,
  SubjectType,
  WorkspaceMetadata,
} from '../../../../permissions';
import Pages from '../pages';
import {
  Diffs,
  DiffType,
  getObjectsDifferences,
} from '../../../../utils/getObjectsDifferences';
import { extractObjectsByPath } from '../../../../utils/extractObjectsByPath';
import { logger } from '../../../../logger';
import {
  AlreadyUsedError,
  InvalidSlugError,
  MissingFieldError,
} from '../../../../errors';
import {
  INIT_WORKSPACE_SECURITY,
  WORKSPACE_SLUG_VALIDATION_REGEXP,
} from '../../../../../config';
import { fetchUsers, NativeSubjectType } from '@prisme.ai/permissions';
import { Security } from '../../..';
import { WorkspaceVersions } from './index';
import { DsulCrud } from '../types';

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

export class Workspaces extends DsulCrud {
  public pages: Pages;
  public versions: WorkspaceVersions;

  private diffHandlers: DSULDiffHandler[];

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    storage: DSULStorage,
    enableCache?: boolean
  ) {
    super(accessManager, broker, storage, logger, enableCache);
    this.pages = new Pages(
      this.accessManager,
      broker,
      this.storage,
      undefined as any
    );
    this.versions = new WorkspaceVersions(
      accessManager,
      broker,
      storage,
      logger,
      enableCache
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
          if (!WORKSPACE_SLUG_VALIDATION_REGEXP.test(workspaceSlug!)) {
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
      {
        path: 'repositories',
        handler: async (allDiffs: DSULDiff[]) => {
          const workspace = allDiffs[0].root;
          if (!workspace?.id || !workspace?.slug) {
            return;
          }
          await this.accessManager.throwUnlessCan(
            ActionType.ManageRepositories,
            SubjectType.Workspace,
            workspace.id
          );

          Object.entries(workspace.repositories || {}).forEach(
            ([repoId, repo]) => {
              if ((repo?.type || 'git') === 'git') {
                if (!repo?.config?.url) {
                  throw new MissingFieldError(
                    `Missing url for  repository '${repoId}''`
                  );
                }

                if (
                  repo?.config?.auth?.password &&
                  !repo.config.url.startsWith('https://')
                ) {
                  throw new MissingFieldError(
                    `Repository URL must start with https:// when used with password authentication (repo: '${repoId})''`
                  );
                } else if (
                  repo?.config?.auth?.sshkey &&
                  !repo.config.url.startsWith('git@')
                ) {
                  throw new MissingFieldError(
                    `Repository URL must start with git@ when used with sshkey authentication (repo: '${repoId})''`
                  );
                }
              }
            }
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
      registerWorkspace: workspace.registerWorkspace,
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
    const { limit, page, labels, email, name, sort, ids, slug } = query || {};
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
    if (ids) {
      mongoQuery.id = {
        $in: ids.split(','),
      };
    }
    if (slug) {
      mongoQuery.slug = slug;
    }

    return await this.accessManager.findAll(SubjectType.Workspace, mongoQuery, {
      pagination: {
        limit,
        page,
      },
      sort,
    });
  };

  duplicateWorkspace = async (workspaceId: string, version?: string) => {
    const {
      slug: fromSlug,
      id: _,
      name: fromName,
      customDomains: __,
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
      // Duplicate runtime model with updated root fields
      this.storage
        .get({
          workspaceId,
          dsulType: DSULType.RuntimeModel,
        })
        .catch(() => undefined)
        .then((model) => {
          if (!model) {
            return;
          }

          const updatedRuntimeModel = {
            ...model,
            ...newWorkspace,
          };

          return this.storage.save(
            {
              workspaceId: newWorkspace.id,
              dsulType: DSULType.RuntimeModel,
            },
            updatedRuntimeModel
          );
        }),
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
      registerWorkspace: workspace.registerWorkspace,
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
}
