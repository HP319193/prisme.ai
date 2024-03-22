import stream from 'stream';
import { ForbiddenError } from '@prisme.ai/permissions';
import { EventType } from '../../../../eda';
import {
  InvalidVersionError,
  ObjectNotFoundError,
  PrismeError,
} from '../../../../errors';
import { ActionType, SubjectType } from '../../../../permissions';
import { DsulCrud } from '../types';
import {
  ValidatedDSULVersion,
  prepareNewDSULVersion,
} from '../../../../utils/prepareNewDSULVersion';
import { DriverType, IStorage } from '../../../../storage/types';
import buildStorage from '../../../../storage';
import { WORKSPACES_STORAGE_GIT_OPTIONS } from '../../../../../config';
import { DSULFolders, DSULRootFiles } from '../../../DSULStorage';
import { join, parse } from 'path';
import { GitExportOptions } from '../../../../storage/drivers/git';
import { WorkspaceExports } from '../exports';

export class WorkspaceVersions extends DsulCrud {
  list = async (workspaceId: string) => {
    const workspaceMetadata = await this.accessManager.get(
      SubjectType.Workspace,
      workspaceId
    );
    return workspaceMetadata.versions || [];
  };

  getRepositoryDriver = async (
    workspace: Prismeai.Workspace,
    repositoryId: string,
    mode: 'write' | 'read'
  ) => {
    if (!(repositoryId in (workspace.repositories || {}))) {
      throw new ObjectNotFoundError(
        `Unknown workspace repository '${repositoryId}'`,
        {
          repositoryId,
          availableRepositories: Object.keys(workspace.repositories || {}),
        }
      );
    }
    const repository: Prismeai.WorkspaceRepository =
      workspace.repositories![repositoryId];
    if (mode === 'write' && repository.mode === 'read-only') {
      throw new ForbiddenError(
        `Can't push to '${repositoryId}' repository as it is configured as read-only`,
        {}
      );
    }

    let driver: IStorage;
    if ((repository.type || 'git') === 'git') {
      driver = buildStorage(DriverType.GIT, {
        ...repository.config,
        ...WORKSPACES_STORAGE_GIT_OPTIONS,
        dirpath: join(WORKSPACES_STORAGE_GIT_OPTIONS.dirpath!, workspace.id!),
      });
    } else {
      throw new PrismeError(
        `Unsupported configured repository type '${repository.type || 'git'}'`,
        {}
      );
    }

    return driver;
  };

  publish = async (
    workspaceId: string,
    versionRequest: Prismeai.WorkspaceVersion,
    workspacesExports: WorkspaceExports
  ): Promise<ValidatedDSULVersion> => {
    const currentVersions = await this.list(workspaceId);
    const { newVersion, allVersions, expiredVersions } = prepareNewDSULVersion(
      currentVersions,
      versionRequest
    );

    const version: ValidatedDSULVersion = {
      ...versionRequest,
      ...newVersion,
    };

    if (!versionRequest.repository?.id) {
      // Save this version inside platform's global workspaces bucket
      await this.storage.copy(
        { workspaceId, parentFolder: true, version: 'current' },
        {
          workspaceId,
          version: version.name,
          parentFolder: true,
        }
      );
    } else {
      // Save this version inside workspace's own repository
      const workspaceMetadata = await this.storage.get({ workspaceId });
      const exportStream = new stream.PassThrough();

      const destDriver = await this.getRepositoryDriver(
        workspaceMetadata,
        versionRequest.repository.id,
        'write'
      );
      const publishedVersion = 'current';
      const exportPromise = workspacesExports.exportWorkspace(
        workspaceId,
        'current',
        'zip',
        exportStream
      );

      const authData = Object.values(
        this.accessManager?.user?.authData || {}
      )[0];

      await Promise.all([
        destDriver.import(`${versionRequest.repository.id}`, exportStream, {
          archive: true,
          removeAdditionalFiles: true,
          meta: {
            description:
              version.description +
              ` | Author : ${authData?.email || this.accessManager?.user?.id}`,
            versionId: version.name,
            email: authData?.email,
            username:
              authData?.firstName || authData?.lastName
                ? `${authData?.firstName || ''} ${authData?.lastName || ''}`
                : undefined,
          },
          // We have to strip beginning current/ folder as we can only export the version folder itself & not its content
          fileCallback: (filepath: string) => {
            if (filepath.startsWith(`${publishedVersion}/`)) {
              filepath = filepath.slice(`${publishedVersion}/`.length);
            }
            return { filepath };
          },
        }),
        exportPromise,
      ]);
    }
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
      .catch((err) => this.logger.error(err));
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

  delete = async (
    workspaceId: string,
    version: string
  ): Promise<ValidatedDSULVersion> => {
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
      .catch((err) => this.logger.error(err));

    return targetVersion;
  };

  pull = async (
    workspaceId: string,
    version: string,
    workspacesExports: WorkspaceExports,
    opts?: PrismeaiAPI.PullWorkspaceVersion.RequestBody
  ) => {
    if (version == 'current') {
      throw new InvalidVersionError('Cannot rollback to current version');
    }
    await this.accessManager.throwUnlessCan(
      ActionType.Update,
      SubjectType.Workspace,
      workspaceId
    );

    let targetVersion: Prismeai.WorkspaceVersion = {
      name: version,
      description: '',
      repository: opts?.repository,
    };
    // For native platform versioning only : check that requested version exists in db
    if (!opts?.repository?.id) {
      const workspaceMetadata = await this.accessManager.get(
        SubjectType.Workspace,
        workspaceId
      );
      const versionDetails =
        version === 'latest' && workspaceMetadata?.versions?.length
          ? workspaceMetadata.versions[workspaceMetadata.versions.length - 1]
          : (workspaceMetadata.versions || []).find(
              (cur) => cur.name == version
            );
      if (!versionDetails) {
        throw new InvalidVersionError(`Unknown version name '${version}'`);
      }
      targetVersion = versionDetails;
    }

    // Prepare the requested version archive
    const exportOptions: GitExportOptions = {
      commit: version !== 'latest' ? version : undefined,
      // Ignore beginning folders as they can vary depending on the extract source (native repository, archive, git versioning ?)
      fileCallback: (filepath) => {
        const parsed = parse(filepath);

        if (
          DSULRootFiles.some((whitelisted) =>
            parsed.name.endsWith(whitelisted)
          ) ||
          (parsed.dir &&
            Object.values(DSULFolders).some((whitelisted) =>
              parsed.dir.endsWith(whitelisted)
            ))
        ) {
          return { filepath };
        }

        return false;
      },
    };

    let versionArchiveStream = new stream.PassThrough(),
      versionArchivePromise: Promise<any>;
    if (!targetVersion.repository?.id) {
      // Export archive from platform global repo
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

      versionArchivePromise = this.storage.export(
        { workspaceId, parentFolder: true, version },
        versionArchiveStream,
        exportOptions
      );
    } else {
      const workspaceMetadata = await this.storage.get({ workspaceId });
      // Export archive from workspace's own repository
      const sourceDriver = await this.getRepositoryDriver(
        workspaceMetadata,
        targetVersion.repository.id,
        'read'
      );
      versionArchivePromise = sourceDriver.export(
        `${targetVersion.repository.id}/`,
        versionArchiveStream,
        exportOptions
      );
    }

    // Finally import this version
    const [importResult] = await Promise.all([
      workspacesExports.importDSUL(
        workspaceId,
        'current',
        versionArchiveStream,
        {
          removeAdditionalFiles: true,
          sourceVersion: targetVersion,
          overwriteWorkspaceSlugIfAvailable: true,
        }
      ),
      versionArchivePromise,
    ]);
    return importResult;
  };
}
