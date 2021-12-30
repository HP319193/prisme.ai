import yaml from "js-yaml";
import { Storage, DriverType } from "./types";
import S3 from "./drivers/s3";
import Filesystem from "./drivers/filesystem";

const getS3Key = (appId: string, version: string = "current") => {
  if (!version) {
    return appId;
  }
  return `${appId}/${version}.yml`;
};

export default class DSULStorage implements Storage {
  private driver: Storage;

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
        throw new Error(`Unknown dsul storage driver ${driverType}`);
    }
  }

  public get(appId: string) {
    return this.driver
      .get(getS3Key(appId))
      .then((data: string) => yaml.load(data));
  }

  public save(appId: string, app: any) {
    return this.driver.save(
      getS3Key(appId),
      yaml.dump(app, { skipInvalid: true })
    );
  }

  public delete(appId: string) {
    return this.driver.delete(getS3Key(appId, ""));
  }
}
