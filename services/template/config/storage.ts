import { FilesystemOptions } from '../src/storage/drivers/filesystem';
import { S3Options } from '../src/storage/drivers/s3';
import { DriverType } from '../src/storage/types';

export const WORKSPACES_STORAGE_TYPE: DriverType =
  (process.env.WORKSPACES_STORAGE_TYPE as DriverType) || DriverType.FILESYSTEM;

/*
 * Filesystem Configuration
 */

export const WORKSPACES_STORAGE_FILESYSTEM_DIRPATH =
  process.env.WORKSPACES_STORAGE_FILESYSTEM_DIRPATH || 'models/';

export const WORKSPACES_STORAGE_FILESYSTEM_OPTIONS: FilesystemOptions = {
  dirpath: WORKSPACES_STORAGE_FILESYSTEM_DIRPATH,
};

/*
 * S3 Configuration
 */
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
