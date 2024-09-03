import { remove as removeDiacritics } from 'diacritics';
import { FilterQuery, FindOptions } from '@prisme.ai/permissions';
import { nanoid } from 'nanoid';
import stream from 'stream';
import {
  UPLOADS_FILESYSTEM_DOWNLOAD_URL,
  PLATFORM_WORKSPACE_ID,
} from '../../config';
import { logger } from '../logger';
import { AccessManager, Role, SubjectType } from '../permissions';
import { IStorage, Streamed } from '../storage/types';
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
  private _driver: IStorage;
  private _driver_public?: IStorage; // If defined, will be used only for public files, while driver will be used for privates ones

  constructor(driver: IStorage, driver_public?: IStorage) {
    this._driver = driver;
    this._driver_public = driver_public;
  }

  private driver(public_file: boolean = false) {
    if (public_file && this._driver_public) {
      return this._driver_public;
    }
    return this._driver;
  }

  getPath(workspaceId: string, filename: string, fileId: string) {
    return `${workspaceId}/${fileId}.${filename}`;
  }

  getUrl(
    file: Omit<Prismeai.File, 'url'>,
    baseUrl: string,
    public_file?: boolean
  ) {
    const driver = this.driver(public_file);

    const path = file.path;
    const driverBaseUrl = driver.baseUrl();
    // Private files will always be downloaded through our local api for access control
    if (file.public && driverBaseUrl) {
      return `${driverBaseUrl}/${path}`;
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
      url: this.getUrl(file, baseUrl, file.public == true),
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
      url: this.getUrl(file, baseUrl, file.public),
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
    if (workspaceId !== PLATFORM_WORKSPACE_ID)
      await accessManager.pullRoleFromSubject(
        SubjectType.Workspace,
        workspaceId
      );

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
            url: this.getUrl(details, baseUrl, publicFile),
          };
        }
      )
    );

    await Promise.all(
      fileDetails.map(async (file, idx) => {
        await this.driver(file.public).save(file.path, files[idx].buffer, {
          mimetype: file.mimetype,
          // Do not pass file public status to storage driver if we have separate drivers for public/private
          // Avoids S3 errors when ACL param is not allowed by bucket configuration
          public: this._driver_public ? undefined : file.public,
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
      // Bucket in-place ACL update
      if (!this._driver_public) {
        await this.driver().save(currentFile.path, undefined, {
          mimetype: currentFile.mimetype,
          public: this._driver_public ? undefined : publicPatch,
        });
      } else {
        // Move objet between our 2 distinct public/private buckets
        const data = await this.driver(currentFile.public).get(
          currentFile.path
        );
        await this.driver(currentFile.public).delete(currentFile.path);
        await this.driver(publicPatch).save(currentFile.path, data, {
          mimetype: currentFile.mimetype,
        });
        updateReq.url = this.getUrl(currentFile, baseUrl, publicPatch);
      }

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
      url: this.getUrl(updatedFile, baseUrl, publicPatch),
    };
  }

  async download(path: string, out: stream.Writable, public_file?: boolean) {
    const data = await this.driver(public_file).get(path, {
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
      await this.driver(file.public).delete(file.path);
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
      const { publicFiles, privateFiles } = files.reduce<{
        privateFiles: Prismeai.File[];
        publicFiles: Prismeai.File[];
      }>(
        ({ publicFiles, privateFiles }, file) => ({
          privateFiles: file.public
            ? privateFiles
            : privateFiles.concat(file as any),
          publicFiles: file.public
            ? publicFiles.concat(file as any)
            : publicFiles,
        }),
        {
          privateFiles: [],
          publicFiles: [],
        }
      );
      if (publicFiles.length) {
        await this.driver(true).deleteMany(publicFiles.map((cur) => cur.path));
      }
      if (privateFiles.length) {
        await this.driver(false).deleteMany(
          privateFiles.map((cur) => cur.path)
        );
      }
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
      await this.driver(false).delete(workspaceId);
    } catch (error) {
      logger.error(error);
    }

    try {
      if (this._driver_public) {
        await this.driver(true).delete(workspaceId);
      }
    } catch (error) {
      logger.error(error);
    }
  }
}

export default FileStorage;
