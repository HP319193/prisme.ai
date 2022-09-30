import { logger } from '../../../logger';
//@ts-ignore
import { hri } from 'human-readable-ids';
import { Broker } from '@prisme.ai/broker';
import DSULStorage from '../../DSULStorage';
import { Workspaces } from '../../workspaces';
import {
  AccessManager,
  getSuperAdmin,
  SubjectType,
} from '../../../permissions';
import { MissingFieldError } from '../../../errors';
// import { areObjectsEqual } from '../../utils/getObjectsDifferences';

interface PagesMigrationOptions {
  workspace: string;
  force?: boolean;
}

export async function migratePages(
  workspacesStorage: DSULStorage,
  accessManager: AccessManager,
  broker: Broker,
  opts: PagesMigrationOptions
) {
  if (!opts.workspace) {
    throw new MissingFieldError(
      'Missing workspace body param. Please specify either "all" or a valid workspaceId'
    );
  }
  logger.info('Migrating pages ...');

  const WorkspacesCollection = accessManager.model(SubjectType.Workspace);
  const PagesCollection = accessManager.model(SubjectType.Page);

  // First sync mongo models
  WorkspacesCollection.syncIndexes();
  PagesCollection.syncIndexes();

  const authorizedAccessManager = await getSuperAdmin(accessManager);
  // const apps = new Apps(authorizedAccessManager, broker as any, appsStorage);
  const workspaces = new Workspaces(
    authorizedAccessManager,
    undefined as any,
    broker as any,
    workspacesStorage
  );

  const allWorkspaces = await workspaces.findWorkspaces();
  const targetWorkspaces =
    opts.workspace.toLowerCase() == 'all'
      ? allWorkspaces
      : allWorkspaces.filter((cur) => cur.id == opts.workspace);

  const migrated = [];
  for (let workspace of targetWorkspaces) {
    try {
      if (workspace.slug && !opts.force) {
        continue;
      }
      const dsul = await workspaces.getWorkspace(workspace.id);
      if (!dsul.pages) {
        dsul.pages = {};
      }

      const pages = await workspaces.pages.list(workspace.id);
      // Add to DSUL mising pages
      const pagesToUpdate = pages
        .map((cur) => {
          if (
            Object.values(dsul.pages || {})?.find(
              (dsulPage) => dsulPage.id == cur.id
            )
          ) {
            return false;
          }
          return cur;
        })
        .filter(Boolean);
      Object.assign(
        dsul.pages,
        pagesToUpdate.reduce(
          (prev, cur) => ({
            ...prev,
            [(cur as any).slug || hri.random()]: { ...cur, __migrate: true },
          }),
          {}
        )
      );

      const updatedDSUL = await workspaces.updateWorkspace(workspace.id, dsul);
      migrated.push(updatedDSUL);
    } catch (err) {
      logger.error({
        msg: `Could not migrate pages of workspace ${workspace.id}`,
        err,
      });
    }
  }

  return migrated;
}
