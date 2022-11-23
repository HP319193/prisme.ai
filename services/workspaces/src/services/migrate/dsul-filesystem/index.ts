import { logger } from '../../../logger';
//@ts-ignore
import { hri } from 'human-readable-ids';
import { Broker } from '@prisme.ai/broker';
import { DSULStorage, DSULType } from '../../dsulStorage';
import { AppInstances, Automations, Pages, Workspaces } from '../../workspaces';
import {
  AccessManager,
  getSuperAdmin,
  SubjectType,
} from '../../../permissions';
import { MissingFieldError } from '../../../errors';
import { Apps } from '../../apps';

interface MigrationOptions {
  workspace: string;
  app: string;
  force?: boolean;
}

type LegacyDSUL = Prismeai.Workspace & {
  imports: Record<string, Prismeai.AppInstance>;
  automations: Record<string, Prismeai.Automation>;
  pages: Record<string, Prismeai.Page>;
};

export async function migrateDSUL(
  dsulStorage: DSULStorage,
  accessManager: AccessManager,
  broker: Broker,
  opts: MigrationOptions
) {
  const legacyWorkspacesStorage = dsulStorage.child(DSULType.DSULIndex, {
    legacy: true,
  });
  if (!opts.workspace) {
    throw new MissingFieldError(
      'Missing workspace body param. Please specify either "all" or a valid workspaceId'
    );
  }
  if (!opts.app) {
    throw new MissingFieldError(
      'Missing app body param. Please specify either "all" or a valid appSlug'
    );
  }

  const authorizedAccessManager = await getSuperAdmin(accessManager);
  const apps = new Apps(authorizedAccessManager, broker as any, dsulStorage);
  const workspaces = new Workspaces(
    authorizedAccessManager,
    broker as any,
    dsulStorage
  );
  const automations = new Automations(
    authorizedAccessManager,
    broker as any,
    dsulStorage
  );
  const appInstances = new AppInstances(
    authorizedAccessManager,
    broker as any,
    dsulStorage,
    apps
  );
  const pages = new Pages(
    authorizedAccessManager,
    broker as any,
    dsulStorage,
    appInstances
  );

  const allWorkspaces = await workspaces.findWorkspaces({ limit: 1000 });
  const targetWorkspaces =
    opts.workspace.toLowerCase() == 'all'
      ? allWorkspaces
      : allWorkspaces.filter((cur) => cur.id == opts.workspace);

  const migrated = [],
    errors = [];
  logger.info(
    `Migrating ${targetWorkspaces.length} workspaces to their filesystem version ...`
  );
  for (let workspace of targetWorkspaces) {
    try {
      let migrationNeeded = !!opts.force;
      if (!migrationNeeded) {
        try {
          await dsulStorage.get({
            workspaceId: workspace.id,
          });
        } catch {
          migrationNeeded = true;
        }
      }
      if (!migrationNeeded) {
        continue;
      }
      const legacy = (await legacyWorkspacesStorage.get({
        workspaceId: workspace.id,
      })) as LegacyDSUL;
      if (Object.keys(legacy?.automations || {}).length > 200) {
        logger.info(
          `Skipping workspace ${workspace.name} (id ${
            workspace.id
          }) since it has ${
            Object.keys(legacy?.automations || {}).length
          } automations`
        );
        continue;
      }
      logger.info(
        'Migrating ' + workspace.name + ' (id: ' + workspace.id + ')...'
      );
      const migration = await migrateWorkspace(
        legacy,
        workspaces,
        automations,
        appInstances,
        pages
      );

      migrated.push(migration);
    } catch (err) {
      logger.error({
        msg: `Could not migrate workspace ${workspace.id}`,
        err,
      });
      errors.push(err);
    }
  }
  const workspacesMigrated = migrated.length;
  logger.info(`Migrated ${workspacesMigrated} workspaces.`);

  const allApps = await apps.listApps();
  const targetApps =
    opts.app.toLowerCase() == 'all'
      ? allApps
      : allApps.filter((cur) => cur.id == opts.app);
  logger.info(
    `Migrating ${targetApps.length} apps to their filesystem version ...`
  );
  for (let app of targetApps) {
    try {
      let migrationNeeded = !!opts.force;
      if (!migrationNeeded) {
        try {
          await dsulStorage.get({
            appSlug: app.slug,
          });
        } catch {
          migrationNeeded = true;
        }
      }
      if (!migrationNeeded) {
        continue;
      }
      await dsulStorage.copy(
        {
          workspaceId: app.workspaceId!,
          version: 'current',
          parentFolder: true,
        },
        {
          appSlug: app.slug,
          version: 'current',
          parentFolder: true,
        }
      );
      await authorizedAccessManager.update(SubjectType.App, {
        id: app.slug!,
        versions: [
          {
            name: 'migration',
            description: `Version 0 (migration)`,
            createdAt: `${new Date().toISOString()}`,
          },
        ],
      });
      migrated.push(app);
    } catch (err) {
      logger.error({
        msg: `Could not migrate app ${app.slug}`,
        err,
      });
      errors.push(err);
    }
  }
  logger.info(`Migrated ${migrated.length - workspacesMigrated} apps.`);

  return { success: migrated, errors };
}

async function migrateWorkspace(
  legacy: LegacyDSUL,
  workspaces: Workspaces,
  automations: Automations,
  appInstances: AppInstances,
  pages: Pages
) {
  const {
    id: workspaceId,
    automations: legacyAutomations = {},
    pages: legacyPages = {},
    imports: legacyImports = {},
    ...workspaceIndex
  } = legacy;

  // Cannot use workspaces.updateWorkspace for the first migration as the current index file does not exist yet
  await ((workspaces as any).storage as DSULStorage).save(
    { workspaceId },
    {} as any
  );
  await workspaces.updateWorkspace(workspaceId!, workspaceIndex);

  for (let [slug, automation] of Object.entries(legacyAutomations || {})) {
    await automations.createAutomation(
      workspaceId!,
      { ...automation, slug },
      true
    );
  }

  for (let [slug, appInstance] of Object.entries(legacyImports || {})) {
    await appInstances.installApp(workspaceId!, { ...appInstance, slug }, true);
  }

  for (let [slug, page] of Object.entries(legacyPages || {})) {
    page.blocks = (page.blocks || []).map(({ name, ...block }: any) => ({
      slug: block.slug || name,
      ...block,
    }));
    await pages.createPage(workspaceId!, { ...page, slug }, true);
    if (legacy.slug) {
      const detailedPage = await pages.getDetailedPage({
        workspaceId: workspaceId!,
        id: page.id!,
      });
      await ((pages as any).storage as DSULStorage).save(
        { workspaceSlug: legacy.slug, slug, dsulType: DSULType.DetailedPage },
        detailedPage as any
      );
    }
  }

  return workspaceIndex;
}
