import yaml from 'js-yaml';
import Storage, { StorageOptions } from '../storage';
import { DriverType } from '../storage/types';

export enum DSULType {
  Workspace = 'workspaces',
  App = 'apps',
}

export default class DSULStorage extends Storage {
  private dsulType: DSULType;

  constructor(
    dsulType: DSULType,
    driverType: DriverType,
    driverOptions: StorageOptions[DriverType]
  ) {
    super(driverType, driverOptions);
    this.dsulType = dsulType;
  }

  getPath(appId: string, version: string = 'current') {
    if (!version) {
      return `${this.dsulType}/${appId}`;
    }
    return `${this.dsulType}/${appId}/${version}.yml`;
  }

  async get(
    appId: string,
    version: string = 'current'
  ): Promise<Prismeai.Workspace> {
    const dsul = await this.driver.get(this.getPath(appId, version));
    return yaml.load(dsul) as Prismeai.Workspace;
  }

  async list(): Promise<PrismeaiAPI.GetWorkspaces.Responses.$200> {
    const dsulIds = await this.driver.find(`${this.dsulType}`);
    const fullDSULs = await Promise.all(
      dsulIds.map(({ key }) => this.get(key))
    );
    return fullDSULs.map(({ name, id }) => ({ name, id }));
  }

  async save(
    appId: string,
    app: Prismeai.Workspace,
    version: string = 'current'
  ) {
    app.id = appId;
    await this.driver.save(
      this.getPath(appId, version),
      yaml.dump(app, { skipInvalid: true })
    );
  }

  async delete(appId: string, version: string = '') {
    await this.driver.delete(this.getPath(appId, version));
  }
}
