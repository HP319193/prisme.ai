import { DriverType, IStorage } from './types';
import S3, { S3Options } from './drivers/s3';
import Filesystem, { FilesystemOptions } from './drivers/filesystem';
import AzureBlob, { AzureBlobOptions } from './drivers/azureblob';
import Git, { GitOptions } from './drivers/git';

export interface StorageOptions {
  [DriverType.S3_LIKE]: S3Options;
  [DriverType.FILESYSTEM]: FilesystemOptions;
  [DriverType.AZURE_BLOB]: AzureBlobOptions;
  [DriverType.GIT]: GitOptions;
}

export default function buildStorage(
  driverType: DriverType,
  options: StorageOptions[DriverType]
): IStorage {
  switch (driverType) {
    case DriverType.S3_LIKE:
      return new S3(options as S3Options);
    case DriverType.FILESYSTEM:
      return new Filesystem(options as FilesystemOptions);
    case DriverType.AZURE_BLOB:
      return new AzureBlob(options as AzureBlobOptions);
    case DriverType.GIT:
      return new Git(options as GitOptions);
    default:
      throw new Error(`Unknown storage driver ${driverType}`);
  }
}
