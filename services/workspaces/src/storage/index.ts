import { DriverType, IStorage } from "./types";
import S3 from "./drivers/s3";
import Filesystem from "./drivers/filesystem";

export default class Storage {
  protected driver: IStorage;

  public constructor(options: any = process.env) {
    const driverType = options.APPS_STORAGE_DRIVER || DriverType.FILESYSTEM;
    switch (driverType) {
      case DriverType.S3_LIKE:
        this.driver = new S3({
          accessKeyId: options.APPS_S3_LIKE_ACCESS_KEY,
          secretAccessKey: options.APPS_S3_LIKE_SECRET_KEY,
          baseUrl: options.APPS_S3_LIKE_BASE_URL,
          endpoint: options.APPS_S3_LIKE_ENDPOINT,
          bucket: options.APPS_S3_LIKE_BUCKET_NAME,
          region: options.APPS_S3_LIKE_REGION,
        });
        break;
      case DriverType.FILESYSTEM:
        this.driver = new Filesystem({
          dirpath: options.APPS_FILESYSTEM_DIRPATH,
        });
        break;
      default:
        throw new Error(`Unknown storage driver ${driverType}`);
    }
  }
}
