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
  async get(appId: string): Promise<Prismeai.Workspace> {
    const dsul = await this.driver.get(getS3Key(appId));
    return yaml.load(dsul) as Prismeai.Workspace;
  }

  async save(appId: string, app: Prismeai.Workspace) {
    app.id = appId;
    await this.driver.save(
      getS3Key(appId),
      yaml.dump(app, { skipInvalid: true })
    );
  }

  async delete(appId: string) {
    await this.driver.delete(getS3Key(appId, ""));
  }
}
