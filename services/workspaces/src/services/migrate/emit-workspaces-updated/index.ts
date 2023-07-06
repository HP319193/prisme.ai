//@ts-ignore
import { hri } from 'human-readable-ids';
import {
  AccessManager,
  getSuperAdmin,
  SubjectType,
} from '../../../permissions';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
import { DSULStorage, DSULType } from '../../DSULStorage';

export interface Options {
  workspaces?: {
    query: any;
    pagination?: {
      page?: number;
      limit?: number;
    };
    sort?: any;
  };
  migrated?: string;
}

export async function initEmitWorkspacesUpdated(
  dsulStorage: DSULStorage,
  accessManager: AccessManager,
  broker: Broker,
  opts: Options
) {
  const authorizedAccessManager = await getSuperAdmin(accessManager);
  const { page: workspacePage = 0, limit: workspaceLimit = 50 } =
    opts?.workspaces?.pagination || {};
  const workspaces = await authorizedAccessManager.findAll(
    SubjectType.Workspace,
    {
      ...opts?.workspaces?.query,
    },
    {
      pagination: {
        limit: workspaceLimit,
        page: workspacePage,
      },
      sort: opts?.workspaces?.sort || {},
    }
  );

  let errors: any[] = [];
  let emittedWorkspaces: any[] = [];
  await Promise.all(
    workspaces.map(async (workspace) => {
      try {
        const dsulIndex = await dsulStorage.get({
          dsulType: DSULType.DSULIndex,
          workspaceId: workspace.id,
        });
        await broker.send<Prismeai.UpdatedWorkspace['payload']>(
          EventType.UpdatedWorkspace,
          {
            workspace: {
              ...dsulIndex,
              id: workspace.id,
              slug: workspace.slug,
              customDomains: workspace.customDomains,
            },
            migrated: opts?.migrated,
          },
          {
            workspaceId: workspace.id,
          },
          {
            options: {
              persist: false,
            },
          },
          true
        );
        emittedWorkspaces.push(workspace);
      } catch (err) {
        errors.push({
          msg: `Could not retrieve runtime model for workspace ${workspace.id}`,
          err,
        });
      }
    })
  );
  return {
    workspaces: emittedWorkspaces,
    errors,
  };
}
