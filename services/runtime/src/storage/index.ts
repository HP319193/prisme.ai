import { DriverType, IStorage } from './types';
import S3, { S3Options } from './drivers/s3';
import Filesystem, { FilesystemOptions } from './drivers/filesystem';
import AzureBlob, { AzureBlobOptions } from './drivers/azureblob';

export interface StorageOptions {
  [DriverType.S3_LIKE]: S3Options;
  [DriverType.FILESYSTEM]: FilesystemOptions;
  [DriverType.AZURE_BLOB]: AzureBlobOptions;
}

export default class Storage {
  protected driver: IStorage;

  public constructor(
    driverType: DriverType,
    options: StorageOptions[DriverType]
  ) {
    switch (driverType) {
      case DriverType.S3_LIKE:
        this.driver = new S3(options as S3Options);
        break;
      case DriverType.FILESYSTEM:
        this.driver = new Filesystem(options as FilesystemOptions);
        break;
      case DriverType.AZURE_BLOB:
        this.driver = new AzureBlob(options as AzureBlobOptions);
        break;
      default:
        throw new Error(`Unknown storage driver ${driverType}`);
    }
  }
}
