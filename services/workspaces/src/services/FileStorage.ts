import { remove as removeDiacritics } from 'diacritics';
import { FilterQuery, FindOptions } from '@prisme.ai/permissions';
import { nanoid } from 'nanoid';
import stream from 'stream';
import {
  UPLOADS_STORAGE_S3_LIKE_BASE_URL,
  UPLOADS_FILESYSTEM_DOWNLOAD_URL,
  UPLOADS_STORAGE_AZURE_BLOB_BASE_URL,
} from '../../config';
import { logger } from '../logger';
import { AccessManager, Role, SubjectType } from '../permissions';
import { DriverType, IStorage, Streamed } from '../storage/types';
import { UPLOADS_MAX_SIZE, UPLOADS_ALLOWED_MIMETYPES } from '../../config';
import { InvalidUploadError } from '../errors';
import { token } from '../utils';

const ALLOWED_MIMETYPES_REGEXP = `^(${UPLOADS_ALLOWED_MIMETYPES.map((cur) =>
  cur.replace(/[*]/g, '.*')
).join('|')})$`;

export type FileUploadRequest = Omit<
  Prismeai.File,
  'url' | 'workspaceId' | 'path'
> & {
  buffer: Buffer;
};

class FileStorage {
  private driver: IStorage;
  constructor(driver: IStorage) {
    this.driver = driver;
  }

  getPath(workspaceId: string, filename: string, fileId: string) {
    return `${workspaceId}/${fileId}.${filename}`;
  }

  getUrl(file: Omit<Prismeai.File, 'url'>, baseUrl: string) {
    const storageType = file.public
      ? this.driver.type()
      : DriverType.FILESYSTEM;
    const path = file.path;
    if (
      storageType === DriverType.S3_LIKE &&
      UPLOADS_STORAGE_S3_LIKE_BASE_URL
    ) {
      return `${UPLOADS_STORAGE_S3_LIKE_BASE_URL}/${path}`;
    }
    if (
      storageType === DriverType.AZURE_BLOB &&
      UPLOADS_STORAGE_AZURE_BLOB_BASE_URL
    ) {
      return `${UPLOADS_STORAGE_AZURE_BLOB_BASE_URL}/${path}`;
    }

    // Proxy mode can be forced by simply not providing storage BASE_URL env var
    return `${UPLOADS_FILESYSTEM_DOWNLOAD_URL || baseUrl}/v2/files/${path}`;
  }

  async list(
    accessManager: Required<AccessManager>,
    baseUrl: string,
    query: any,
    opts?: FindOptions
  ) {
    const result = await accessManager.findAll(SubjectType.File, query, {
      sort: '-createdAt',
      ...opts,
    });
    return result.map((file) => ({
      ...file,
      url: this.getUrl(file, baseUrl),
    }));
  }

  async get(
    accessManager: Required<AccessManager>,
    id: string | FilterQuery<Prismeai.File, Role>,
    baseUrl: string
  ) {
    const file = await accessManager.get(SubjectType.File, id);
    return {
      ...file,
      url: this.getUrl(file, baseUrl),
    };
  }

  private validateUploads(files: FileUploadRequest[]) {
    files.forEach((file) => {
      if (file.size > UPLOADS_MAX_SIZE) {
        throw new InvalidUploadError(
          `Invalid uploaded file '${file.name}' : size must not exceed ${UPLOADS_MAX_SIZE} bytes`
        );
      }

      if (!file.mimetype.match(new RegExp(ALLOWED_MIMETYPES_REGEXP))) {
        throw new InvalidUploadError(
          `Invalid uploaded file '${
            file.name
          }' : mimetype must be one of ${UPLOADS_ALLOWED_MIMETYPES.join(', ')}`
        );
      }
    });
  }

  async upload(
    accessManager: Required<AccessManager>,
    workspaceId: string,
    baseUrl: string,
    files: FileUploadRequest[]
  ): Promise<Prismeai.File[]> {
    this.validateUploads(files);

    // Without this & with multiple files, only first create() call would pull permissions & subsequent ones would throw a PermissionsError
    await accessManager.pullRoleFromSubject(SubjectType.Workspace, workspaceId);

    const fileDetails = await Promise.all(
      files.map(
        async ({
          size,
          name: originalname,
          expiresAfter,
          mimetype,
          metadata,
          shareToken,
          public: publicFile,
        }) => {
          const id = nanoid();
          const filename = removeDiacritics(originalname)
            .slice(0, 250)
            .replace(/\0/g, '');
          const path = this.getPath(workspaceId, filename, id);
          let expiresAt;
          if (expiresAfter) {
            expiresAt = new Date(
              new Date().getTime() + expiresAfter * 1000
            ).toISOString();
          }

          shareToken = shareToken !== 'true' ? undefined : token();
          const details = await accessManager.create(
            SubjectType.File,
            {
              mimetype,
              name: originalname,
              size,
              workspaceId,
              path,
              id,
              expiresAt,
              expiresAfter,
              metadata,
              public: publicFile,
              shareToken,
            },
            {
              publicRead: publicFile,
            }
          );

          return {
            ...details,
            url: this.getUrl(details, baseUrl),
          };
        }
      )
    );

    await Promise.all(
      fileDetails.map(async (file, idx) => {
        await this.driver.save(file.path, files[idx].buffer, {
          mimetype: file.mimetype,
          public: file.public,
        });
      })
    );

    return fileDetails;
  }

  async updateFile(
    accessManager: Required<AccessManager>,
    id: string,
    userPatch: Partial<Prismeai.File>,
    baseUrl: string
  ) {
    const currentFile = await this.get(
      accessManager,
      {
        $or: [{ id }, { path: id }],
      },
      baseUrl
    );

    const {
      public: publicPatch,
      shareToken: shareTokenPatch,
      ...patchedField
    } = userPatch;
    const updateReq: Partial<Prismeai.File> = patchedField;
    if (
      typeof publicPatch === 'boolean' &&
      publicPatch !== currentFile.public
    ) {
      await this.driver.save(currentFile.path, undefined, {
        public: publicPatch,
      });
      updateReq.public = publicPatch;
    }

    if (shareTokenPatch && !currentFile.shareToken) {
      updateReq.shareToken = token();
    } else if ((shareTokenPatch as any) === false && currentFile.shareToken) {
      updateReq.shareToken = undefined;
    }

    let updatedFile: Omit<Prismeai.File, 'url'> & { id: string } = {
      ...currentFile,
      ...updateReq,
      id: currentFile.id,
    };
    if (Object.keys(updateReq).length || typeof publicPatch === 'boolean') {
      updatedFile = await accessManager.update(SubjectType.File, updatedFile, {
        publicRead: updatedFile.public,
      });
    }

    return {
      ...updatedFile,
      url: this.getUrl(updatedFile, baseUrl),
    };
  }

  async download(path: string, out: stream.Writable) {
    const data = await this.driver.get(path, {
      stream: out,
    });
    // If driver does not support streaming, handle it ourselves
    if (data !== Streamed) {
      out.end(data);
    }
  }

  async delete(
    accessManager: Required<AccessManager>,
    id: string | FilterQuery<Prismeai.File, Role>
  ) {
    const file = await this.get(accessManager, id, '');

    try {
      await this.driver.delete(file.path);
    } catch (error) {
      logger.error(error);
    }
    await accessManager.delete(SubjectType.File, file.id);
  }

  async deleteMany(
    accessManager: Required<AccessManager>,
    query: FilterQuery<Prismeai.File, Role>
  ) {
    const files = await accessManager.deleteMany(SubjectType.File, query);

    try {
      await this.driver.deleteMany(files.map((cur) => cur.path));
    } catch (error) {
      logger.error(error);
    }

    return files;
  }

  async deleteWorkspace(
    accessManager: Required<AccessManager>,
    workspaceId: string
  ) {
    const files = await this.list(accessManager, '', {
      workspaceId,
    });
    if (files.length) {
      await Promise.all(
        files.map((cur) => accessManager.delete(SubjectType.File, cur.id))
      );
    }

    try {
      await this.driver.delete(workspaceId);
    } catch (error) {
      logger.error(error);
    }
  }
}

export default FileStorage;
