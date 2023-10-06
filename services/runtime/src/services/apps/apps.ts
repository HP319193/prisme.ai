import yaml from 'js-yaml';
import { ObjectNotFoundError } from '../../errors';
import Storage, { StorageOptions } from '../../storage';
import { DriverType } from '../../storage/types';

type AppSlug = string;
type AppVersion = string;
interface App {
  versions: Record<AppVersion, Prismeai.RuntimeModel>;
}

export class Apps extends Storage {
  private apps: Record<AppSlug, App>;

  constructor(
    driverType: DriverType,
    driverOptions: StorageOptions[DriverType]
  ) {
    super(driverType, driverOptions);
    this.apps = {};
  }

  async getApp(appSlug: string, appVersion?: string) {
    const version = appVersion || 'current';
    const app = this.apps[appSlug];
    if (!app || !(version in app.versions)) {
      await this.fetchApp(appSlug, version);
    }
    return this.apps[appSlug].versions[version];
  }

  modelPath(appSlug: string, appVersion: string) {
    return `apps/${appSlug}/versions/${appVersion}/runtime.yml`;
  }

  public async fetchApp(
    appSlug: string,
    appVersion: string
  ): Promise<Prismeai.RuntimeModel> {
    try {
      const raw = await this.driver.get(this.modelPath(appSlug, appVersion));
      const dsul = yaml.load(raw) as Prismeai.RuntimeModel;
      this.loadAppDSUL(appSlug, appVersion, dsul);
      return dsul;
    } catch (err) {
      if (err instanceof ObjectNotFoundError) {
        throw new ObjectNotFoundError(`App not found`, { appSlug, appVersion });
      }
      throw err;
    }
  }

  public loadAppDSUL(
    appSlug: string,
    appVersion: string,
    dsul: Prismeai.RuntimeModel
  ) {
    if (!(appSlug in this.apps)) {
      this.apps[appSlug] = { versions: {} };
    }
    this.apps[appSlug].versions[appVersion] = dsul;
  }

  public async saveAppDSUL(
    appSlug: string,
    appVersion: string,
    dsul: Prismeai.RuntimeModel
  ) {
    await this.driver.save(
      this.modelPath(appSlug, appVersion),
      yaml.dump(dsul)
    );
    this.loadAppDSUL(appSlug, appVersion, dsul);
  }
}
