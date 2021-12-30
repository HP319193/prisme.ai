import yaml from "js-yaml";
import { IStorage } from "../../storage/types";
import Storage from "../../storage";

const getS3Key = (appId: string, version: string = "current") => {
  if (!version) {
    return appId;
  }
  return `${appId}/${version}.yml`;
};

export default class DSULStorage extends Storage implements IStorage {
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
