//@ts-ignore
import { hri } from 'human-readable-ids';
import { Broker } from '@prisme.ai/broker';
import { DSULStorage } from '../../DSULStorage';
import { Security, Workspaces } from '../../workspaces';
import {
  AccessManager,
  getSuperAdmin,
  SubjectType,
} from '../../../permissions';
import { MissingFieldError } from '../../../errors';
import {
  DISABLE_APIKEY_PAGES_LABEL,
  INIT_WORKSPACE_SECURITY,
} from '../../../../config';

const SECURITY_MIGRATED_WORKSPACE_LABEL = 'customRoles:migrated';

interface MigrationOptions {
  workspace: string;
}

interface MigratedPage {
  id: string;
  name: string;
  slug: string;
  public: boolean;
  shared: boolean; // Whether this page is shared to someone (excluding workspace's owner/editor)
}

interface MigratedWorkspace {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  workspaceLabels: string[];
  pages: MigratedPage[];
  deleted?: boolean;
  hasSomePublicPage: boolean;
  hasSomePrivateSharedPage: boolean;
}

export async function initCustomRoles(
  dsulStorage: DSULStorage,
  accessManager: AccessManager,
  broker: Broker,
  opts: MigrationOptions
) {
  if (!opts.workspace || opts.workspace == 'all') {
    throw new MissingFieldError(
      'Missing or invalid workspace body param. Please specify a valid workspaceId'
    );
  }

  const authorizedAccessManager = await getSuperAdmin(accessManager);
  const workspaces = new Workspaces(
    authorizedAccessManager,
    broker as any,
    dsulStorage
  );
  const security = new Security(authorizedAccessManager, broker, dsulStorage);

  const [allPages, allWorkspaces] = await Promise.all([
    authorizedAccessManager.findAll(
      SubjectType.Page,
      {
        labels: {
          $nin: [DISABLE_APIKEY_PAGES_LABEL],
        },
      },
      {
        pagination: {
          limit: 3000,
        },
      }
    ),
    authorizedAccessManager.findAll(
      SubjectType.Workspace,
      {},
      {
        pagination: {
          limit: 3000,
        },
      }
    ),
  ]);

  const workspacesPerId: Record<string, Prismeai.Workspace> =
    allWorkspaces.reduce(
      (workspacesPerId, workspace) => ({
        ...workspacesPerId,
        [workspace.id]: workspace,
      }),
      {} as any
    );
  let pagesFromDeletedWorkspaces = 0;
  const pagesPerWorkspace: Record<string, Prismeai.Page[]> = allPages.reduce(
    (pagesPerWorkspace, page) => {
      const workspace = workspacesPerId[page.workspaceId!];
      if (!workspace) {
        pagesFromDeletedWorkspaces++;
        return pagesPerWorkspace;
      }
      return {
        ...pagesPerWorkspace,
        [page.workspaceId!]: [
          ...(pagesPerWorkspace?.[page.workspaceId!] || []),
          page,
        ],
      };
    },
    {} as any
  );

  const migrationTasks: MigratedWorkspace[] = await Promise.all(
    allWorkspaces.map<Promise<MigratedWorkspace>>(async (workspace) => {
      const pages = pagesPerWorkspace[workspace.id] || [];
      const migratedPages: MigratedPage[] = pages.map<MigratedPage>((cur) => ({
        id: cur.id!,
        slug: cur.slug!,
        name: cur.name! as any,
        public: cur.permissions?.['*']?.policies?.read === true,
        shared: Object.entries(cur?.permissions || {}).some(
          // Shared is true only if page is shared to someone not editor nor owner from the workspace
          ([sharedId, perms]) =>
            sharedId !== '*' &&
            (perms as any)?.policies?.read === true &&
            !(sharedId in ((<any>workspace).permissions || {}))
        ),
      }));
      return {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceSlug: workspace.slug,
        workspaceLabels: workspace.labels || [],
        pages: migratedPages,
        hasSomePublicPage: migratedPages.some((cur) => cur.public), // Workspace with at least 1 page would need equivalent wildcard rules.
        hasSomePrivateSharedPage: migratedPages.some((cur) => cur.shared), // Workspace with some privately shared pages would need manual action to implement proper custom roles
      };
    })
  );

  let migratedWorkspaces: MigratedWorkspace[] = [];
  let errors: any[] = [];
  let workspacesWithPrivateSharedPages = 0;
  for (let task of migrationTasks) {
    try {
      let { workspaceId, hasSomePrivateSharedPage, workspaceLabels } = task;
      // Check that DSUL index exists
      await workspaces.getWorkspaceAsAdmin(workspaceId);

      let addRules = [];
      let addRoles = {};
      let addLabels = [];

      if (hasSomePrivateSharedPage) {
        workspacesWithPrivateSharedPages++;
      }

      if (!workspaceLabels.includes(SECURITY_MIGRATED_WORKSPACE_LABEL)) {
        addRoles = {
          ...addRoles,
          ...INIT_WORKSPACE_SECURITY?.authorizations?.roles,
        };
        addRules.push(...(<any>INIT_WORKSPACE_SECURITY).authorizations.rules);
        addLabels.push(SECURITY_MIGRATED_WORKSPACE_LABEL);
      }

      if (addLabels.length) {
        const currentSecurity = await security.getSecurity(workspaceId);
        await Promise.all([
          security.updateSecurity(workspaceId, {
            ...currentSecurity,
            authorizations: {
              ...currentSecurity.authorizations,
              roles: {
                ...currentSecurity?.authorizations?.roles,
                ...addRoles,
              },
              rules: [
                ...(currentSecurity?.authorizations?.rules || []),
                ...(addRules as any),
              ],
            },
          }),
          workspaces.updateWorkspace(workspaceId, {
            labels: [...workspaceLabels, ...addLabels],
          } as any),
        ]);
        migratedWorkspaces.push(task);
      }
    } catch (err) {
      errors.push(err);
    }
  }

  return {
    migratedWorkspaces: migratedWorkspaces.length,
    alreadyMigratedWorkspaces:
      migrationTasks.length - migratedWorkspaces.length - errors.length,
    workspacesWithPrivateSharedPages,
    pagesFromDeletedWorkspaces,
    details: migratedWorkspaces,
    errors,
  };
}
