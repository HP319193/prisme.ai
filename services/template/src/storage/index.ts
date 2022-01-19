import { DriverType, IStorage } from "./types";
import S3 from "./drivers/s3";
import Filesystem from "./drivers/filesystem";
import {
  WORKSPACES_STORAGE_FILESYSTEM_OPTIONS,
  WORKSPACES_STORAGE_S3_OPTIONS,
} from "../../config";

export default class Storage {
  protected driver: IStorage;

  public constructor(driverType: DriverType) {
    switch (driverType) {
      case DriverType.S3_LIKE:
        this.driver = new S3(WORKSPACES_STORAGE_S3_OPTIONS);
        break;
      case DriverType.FILESYSTEM:
        this.driver = new Filesystem(WORKSPACES_STORAGE_FILESYSTEM_OPTIONS);
        break;
      default:
        throw new Error(`Unknown storage driver ${driverType}`);
    }
  }
}
