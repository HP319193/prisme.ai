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
        `Unknown workspce repository '${repositoryId}'`,
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
    versionRequest: Prismeai.WorkspaceVersion
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
      const exportPromise = this.storage.export(
        { workspaceId, parentFolder: true, version: publishedVersion },
        exportStream
      );

      await Promise.all([
        destDriver.import(`${workspaceId}`, exportStream, {
          archive: true,
          removeAdditionalFiles: true,
          description: version.description,
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

      return version;
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
    opts?: PrismeaiAPI.PullWorkspaceVersion.RequestBody
  ) => {
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
    this.broker.send<Prismeai.PullWorkspaceVersion['payload']>(
      EventType.PulledWorkspaceVersion,
      {
        version: targetVersion,
      },
      { workspaceId }
    );
    return targetVersion;
  };
}
