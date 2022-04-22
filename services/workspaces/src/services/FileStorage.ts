import { FilterQuery, FindOptions } from '@prisme.ai/permissions';
import { nanoid } from 'nanoid';
import {
  UPLOADS_STORAGE_S3_LIKE_BASE_URL,
  UPLOADS_FILESYSTEM_DOWNLOAD_URL,
} from '../../config';
import { logger } from '../logger';
import { AccessManager, Role, SubjectType } from '../permissions';
import Storage, { StorageOptions } from '../storage';
import { DriverType } from '../storage/types';
import { UPLOADS_MAX_SIZE, UPLOADS_ALLOWED_MIMETYPES } from '../../config';
import { InvalidUploadError } from '../errors';

const ALLOWED_MIMETYPES_REGEXP = `^(${UPLOADS_ALLOWED_MIMETYPES.map((cur) =>
  cur.replace(/[*]/g, '.*')
).join('|')})$`;
class FileStorage extends Storage {
  constructor(
    driverType: DriverType,
    driverOptions: StorageOptions[DriverType]
  ) {
    super(driverType, driverOptions);
  }

  getPath(workspaceId: string, filename: string, fileId: string) {
    return `${workspaceId}/${fileId}.${filename}`;
  }

  getUrl(storageType: DriverType, path: string, baseUrl: string) {
    if (storageType === DriverType.FILESYSTEM) {
      return `${UPLOADS_FILESYSTEM_DOWNLOAD_URL || baseUrl}/v2/files/${path}`;
    }
    if (storageType === DriverType.S3_LIKE) {
      return `${UPLOADS_STORAGE_S3_LIKE_BASE_URL}/${path}`;
    }
    throw new Error(`Unsupported upload storage type '${storageType}'`);
  }

  async list(
    accessManager: Required<AccessManager>,
    workspaceId: string,
    baseUrl: string,
    query: any,
    opts?: FindOptions
  ) {
    const result = await accessManager.findAll(
      SubjectType.File,
      {
        ...query,
        workspaceId,
      },
      opts
    );
    return result.map((file) => ({
      ...file,
      url: this.getUrl(
        this.driverType,
        this.getPath(workspaceId, file.name, file.id),
        baseUrl
      ),
    }));
  }

  async get(
    accessManager: Required<AccessManager>,
    id: string | FilterQuery<Prismeai.Page, Role>,
    baseUrl: string
  ) {
    const file = await accessManager.get(SubjectType.File, id);
    return { ...file, url: this.getUrl(this.driverType, file.path, baseUrl) };
  }

  validateUploads(files: Express.Multer.File[]) {
    files.forEach((file) => {
      if (file.size > UPLOADS_MAX_SIZE) {
        throw new InvalidUploadError(
          `Invalid uploaded file '${file.originalname}' : size must not exceed ${UPLOADS_MAX_SIZE} bytes`
        );
      }

      if (!file.mimetype.match(new RegExp(ALLOWED_MIMETYPES_REGEXP))) {
        throw new InvalidUploadError(
          `Invalid uploaded file '${
            file.originalname
          }' : mimetype must be one of ${UPLOADS_ALLOWED_MIMETYPES.join(', ')}`
        );
      }
    });
  }

  async upload(
    accessManager: Required<AccessManager>,
    workspaceId: string,
    baseUrl: string,
    files: Express.Multer.File[]
  ) {
    this.validateUploads(files);

    // Without this & with multiple files, only first create() call would pull permissions & subsequent ones would throw a PermissionsError
    await accessManager.pullRoleFromSubject(SubjectType.Workspace, workspaceId);

    const fileDetails = await Promise.all(
      files.map(async ({ size, originalname: filename, mimetype }) => {
        const id = nanoid();
        const path = this.getPath(workspaceId, filename, id);
        const details = await accessManager.create(SubjectType.File, {
          mimetype,
          name: filename,
          size,
          workspaceId,
          path,
          id,
        });
        return {
          ...details,
          url: this.getUrl(this.driverType, path, baseUrl),
        };
      })
    );
    await Promise.all(
      fileDetails.map(async (file, idx) => {
        await this.driver.save(file.path, files[idx].buffer);
      })
    );

    return fileDetails;
  }

  async delete(
    accessManager: Required<AccessManager>,
    id: string | FilterQuery<Prismeai.Page, Role>
  ) {
    const file = await this.get(accessManager, id, '');
    try {
      await this.driver.delete(file.path);
    } catch (error) {
      logger.error(error);
    }
    await accessManager.delete(SubjectType.File, file.id);
  }

  async deleteWorkspace(
    accessManager: Required<AccessManager>,
    workspaceId: string
  ) {
    const files = await this.list(accessManager, workspaceId, '', {});
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
