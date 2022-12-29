import { DriverType, IStorage } from './types';
import S3, { S3Options } from './drivers/s3';
import Filesystem, { FilesystemOptions } from './drivers/filesystem';

export interface StorageOptions {
  [DriverType.S3_LIKE]: S3Options;
  [DriverType.FILESYSTEM]: FilesystemOptions;
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
    default:
      throw new Error(`Unknown storage driver ${driverType}`);
  }
}
