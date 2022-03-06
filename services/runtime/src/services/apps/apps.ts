import yaml from 'js-yaml';
import { ObjectNotFoundError } from '../../errors';
import Storage from '../../storage';
import { DriverType } from '../../storage/types';

type AppId = string;
type AppVersion = string;
interface App {
  versions: Record<AppVersion, Prismeai.DSUL>;
}

export class Apps extends Storage {
  private apps: Record<AppId, App>;

  constructor(driverType: DriverType) {
    super(driverType);
    this.apps = {};
  }

  async getApp(appId: string, appVersion?: string) {
    const version = appVersion || 'current';
    const app = this.apps[appId];
    if (!app || !(version in app.versions)) {
      await this.fetchApp(appId, version);
    }
    return this.apps[appId].versions[version];
  }

  public async fetchApp(
    appId: string,
    appVersion: string
  ): Promise<Prismeai.DSUL> {
    try {
      const raw = await this.driver.get(`apps/${appId}/${appVersion}.yml`);
      const dsul = yaml.load(raw) as Prismeai.DSUL;
      if (!(appId in this.apps)) {
        this.apps[appId] = { versions: {} };
      }
      this.apps[appId].versions[appVersion] = dsul;
      return dsul;
    } catch (err) {
      if (err instanceof ObjectNotFoundError) {
        throw new ObjectNotFoundError(`App not found`, { appId, appVersion });
      }
      throw err;
    }
  }
}
