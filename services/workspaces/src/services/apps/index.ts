export { default as Apps } from './crud/apps';
import fetch from 'node-fetch';
import DSULStorage from '../DSULStorage';
import yaml from 'js-yaml';
import { default as Apps } from './crud/apps';
import { AccessManager, SubjectType, Role } from '../../permissions';
import { logger } from '../../logger';
import { Broker } from '@prisme.ai/broker';
import { areObjectsEqual } from '../../utils/getObjectsDifferences';

export async function autoinstallApps(
  appStorage: DSULStorage,
  accessManager: AccessManager
) {
  logger.info('Auto-installing apps ...');

  const authorizedAccessManager = await accessManager.as({
    id: 'api',
    role: Role.SuperAdmin,
  });
  const apps = new Apps(
    authorizedAccessManager,
    {
      send: () => undefined,
    } as any as Broker,
    appStorage
  );

  const dsulURLs = Object.entries(process.env)
    .filter(([k]) => k.startsWith('AUTOINSTALL_APP_'))
    .map(([k, url]) => url && url?.trim())
    .filter(Boolean);
  for (let url of dsulURLs) {
    try {
      const app = yaml.load(
        await (await fetch(url!)).text()
      ) as any as Prismeai.DSUL;

      // Check if given app already exists
      let workspaceId;
      try {
        const currentApp = await apps.getApp(app.name);
        delete currentApp.id;
        delete app.id;
        if (areObjectsEqual(currentApp, app)) {
          logger.info(`App '${app.name}' is already up to date`);
          return;
        }
        workspaceId = await (
          await authorizedAccessManager.get(SubjectType.App, app.name)
        ).workspaceId;
      } catch {}

      await apps.publishApp(
        {
          workspaceId: workspaceId || app.name,
          name: app.name,
          slug: app.name,
        },
        app
      );
      logger.info(
        `Succesfully ${workspaceId ? 'updated' : 'installed'} app '${app.name}'`
      );
    } catch (err) {
      logger.error({
        msg: `Could not autoinstall app from following url : '${url}'`,
        url,
        err,
      });
    }
  }
}
