import { FilesystemOptions } from '../src/storage/drivers/filesystem';
import { S3Options } from '../src/storage/drivers/s3';
import { DriverType } from '../src/storage/types';
import { AccessManagerOptions } from '@prisme.ai/permissions';
import { StorageOptions } from '../src/storage';
import { AzureBlobOptions } from '../src/storage/drivers/azureblob';

export const WORKSPACES_STORAGE_TYPE: DriverType =
  (process.env.WORKSPACES_STORAGE_TYPE as DriverType) || DriverType.FILESYSTEM;

export const UPLOADS_STORAGE_TYPE: DriverType =
  (process.env.UPLOADS_STORAGE_TYPE as DriverType) || WORKSPACES_STORAGE_TYPE;

export const UPLOADS_FILESYSTEM_DOWNLOAD_URL =
  process.env.UPLOADS_FILESYSTEM_DOWNLOAD_URL;

export const UPLOADS_MAX_SIZE = parseInt(
  process.env.UPLOADS_MAX_SIZE || '10000000' // 10MB
);

export const UPLOADS_ALLOWED_MIMETYPES = (
  process.env.UPLOADS_ALLOWED_MIMETYPES ||
  'image/*,text/*,video/*,audio/*,application/*'
).split(',');

export const UPLOADS_DEFAULT_VISIBILITY =
  process.env.UPLOADS_DEFAULT_VISIBILITY || 'public';

/*
 * Filesystem Configuration
 */

// Workspace models
export const WORKSPACES_STORAGE_FILESYSTEM_DIRPATH =
  process.env.WORKSPACES_STORAGE_FILESYSTEM_DIRPATH || '../../data/models/';

export const WORKSPACES_STORAGE_FILESYSTEM_OPTIONS: FilesystemOptions = {
  dirpath: WORKSPACES_STORAGE_FILESYSTEM_DIRPATH,
};

// Uploads
export const UPLOADS_STORAGE_FILESYSTEM_DIRPATH =
  process.env.UPLOADS_STORAGE_FILESYSTEM_DIRPATH || '../../data/uploads/';

export const UPLOADS_STORAGE_FILESYSTEM_OPTIONS: FilesystemOptions = {
  dirpath: UPLOADS_STORAGE_FILESYSTEM_DIRPATH,
};

/*
 * S3 Configuration
 */

// Workspace models
export const WORKSPACES_STORAGE_S3_LIKE_ACCESS_KEY =
  process.env.WORKSPACES_STORAGE_S3_LIKE_ACCESS_KEY!!;

export const WORKSPACES_STORAGE_S3_LIKE_SECRET_KEY =
  process.env.WORKSPACES_STORAGE_S3_LIKE_SECRET_KEY!!;

export const WORKSPACES_STORAGE_S3_LIKE_BASE_URL =
  process.env.WORKSPACES_STORAGE_S3_LIKE_BASE_URL!!;

export const WORKSPACES_STORAGE_S3_LIKE_ENDPOINT =
  process.env.WORKSPACES_STORAGE_S3_LIKE_ENDPOINT!!;

export const WORKSPACES_STORAGE_S3_LIKE_BUCKET_NAME =
  process.env.WORKSPACES_STORAGE_S3_LIKE_BUCKET_NAME!!;

export const WORKSPACES_STORAGE_S3_LIKE_REGION =
  process.env.WORKSPACES_STORAGE_S3_LIKE_REGION!!;

export const WORKSPACES_STORAGE_S3_OPTIONS: S3Options = {
  accessKeyId: WORKSPACES_STORAGE_S3_LIKE_ACCESS_KEY,
  secretAccessKey: WORKSPACES_STORAGE_S3_LIKE_SECRET_KEY,
  baseUrl: WORKSPACES_STORAGE_S3_LIKE_BASE_URL,
  endpoint: WORKSPACES_STORAGE_S3_LIKE_ENDPOINT,
  bucket: WORKSPACES_STORAGE_S3_LIKE_BUCKET_NAME,
  region: WORKSPACES_STORAGE_S3_LIKE_REGION,
};

// Uploads
export const UPLOADS_STORAGE_S3_LIKE_ACCESS_KEY =
  process.env.UPLOADS_STORAGE_S3_LIKE_ACCESS_KEY!!;

export const UPLOADS_STORAGE_S3_LIKE_SECRET_KEY =
  process.env.UPLOADS_STORAGE_S3_LIKE_SECRET_KEY!!;

export const UPLOADS_STORAGE_S3_LIKE_BASE_URL =
  process.env.UPLOADS_STORAGE_S3_LIKE_BASE_URL!!;

export const UPLOADS_STORAGE_S3_LIKE_ENDPOINT =
  process.env.UPLOADS_STORAGE_S3_LIKE_ENDPOINT!!;

export const UPLOADS_STORAGE_S3_LIKE_BUCKET_NAME =
  process.env.UPLOADS_STORAGE_S3_LIKE_BUCKET_NAME!!;

export const UPLOADS_STORAGE_S3_LIKE_REGION =
  process.env.UPLOADS_STORAGE_S3_LIKE_REGION!!;

export const UPLOADS_STORAGE_S3_OPTIONS: S3Options = {
  accessKeyId: UPLOADS_STORAGE_S3_LIKE_ACCESS_KEY,
  secretAccessKey: UPLOADS_STORAGE_S3_LIKE_SECRET_KEY,
  baseUrl: UPLOADS_STORAGE_S3_LIKE_BASE_URL,
  endpoint: UPLOADS_STORAGE_S3_LIKE_ENDPOINT,
  bucket: UPLOADS_STORAGE_S3_LIKE_BUCKET_NAME,
  region: UPLOADS_STORAGE_S3_LIKE_REGION,
};

/*
 * Azure Blob configuration
 */

// Workspace models
export const WORKSPACES_STORAGE_AZURE_BLOB_CONTAINER =
  process.env.WORKSPACES_STORAGE_AZURE_BLOB_CONTAINER || 'models';

export const WORKSPACES_STORAGE_AZURE_BLOB_CONNECTION_STRING =
  process.env.WORKSPACES_STORAGE_AZURE_BLOB_CONNECTION_STRING!!;

export const WORKSPACES_STORAGE_AZURE_BLOB_OPTIONS: AzureBlobOptions = {
  container: WORKSPACES_STORAGE_AZURE_BLOB_CONTAINER,
  connectionString: WORKSPACES_STORAGE_AZURE_BLOB_CONNECTION_STRING,
};

// Uploads
export const UPLOADS_STORAGE_AZURE_BLOB_CONTAINER =
  process.env.UPLOADS_STORAGE_AZURE_BLOB_CONTAINER || 'uploads';

export const UPLOADS_STORAGE_AZURE_BLOB_CONNECTION_STRING =
  process.env.UPLOADS_STORAGE_AZURE_BLOB_CONNECTION_STRING!!;

export const UPLOADS_STORAGE_AZURE_BLOB_BASE_URL =
  process.env.UPLOADS_STORAGE_AZURE_BLOB_BASE_URL!!;

export const UPLOADS_STORAGE_AZURE_BLOB_OPTIONS: AzureBlobOptions = {
  container: UPLOADS_STORAGE_AZURE_BLOB_CONTAINER,
  connectionString: UPLOADS_STORAGE_AZURE_BLOB_CONNECTION_STRING,
  baseUrl: UPLOADS_STORAGE_AZURE_BLOB_BASE_URL,
};

/*
 * All drivers config mapping
 */

export const WORKSPACES_STORAGE_OPTIONS: StorageOptions = {
  [DriverType.FILESYSTEM]: WORKSPACES_STORAGE_FILESYSTEM_OPTIONS,
  [DriverType.S3_LIKE]: WORKSPACES_STORAGE_S3_OPTIONS,
  [DriverType.AZURE_BLOB]: WORKSPACES_STORAGE_AZURE_BLOB_OPTIONS,
};

export const UPLOADS_STORAGE_OPTIONS: StorageOptions = {
  [DriverType.FILESYSTEM]: UPLOADS_STORAGE_FILESYSTEM_OPTIONS,
  [DriverType.S3_LIKE]: UPLOADS_STORAGE_S3_OPTIONS,
  [DriverType.AZURE_BLOB]: UPLOADS_STORAGE_AZURE_BLOB_OPTIONS,
};

/**
 * Permissions MongoDB
 */
export const PERMISSIONS_STORAGE_HOST =
  process.env.PERMISSIONS_STORAGE_HOST ||
  'mongodb://localhost:27017/permissions';

export const PERMISSIONS_STORAGE_MONGODB_OPTIONS: AccessManagerOptions['storage'] =
  {
    host: PERMISSIONS_STORAGE_HOST,
    driverOptions: extractOptsFromEnv('PERMISSIONS_STORAGE_OPT_'),
  };

function extractOptsFromEnv(prefix: string) {
  return Object.entries(process.env)
    .filter(([key]) => key.startsWith(prefix))
    .reduce((env, [k, v]: [string, any]) => {
      if (v === 'true') {
        v = true;
      } else if (v === 'false') {
        v = false;
      } else if (parseInt(v)) {
        v = parseInt(v);
      }
      return {
        ...env,
        [k.slice(prefix.length)]: v,
      };
    }, {});
}
