//@ts-ignore
import { hri } from 'human-readable-ids';
import { DSULStorage, DSULType } from '../../DSULStorage';
import {
  AccessManager,
  getSuperAdmin,
  SubjectType,
} from '../../../permissions';
import { logger } from '../../../logger';
import { interpolate } from '../../../utils/interpolate';

interface Options {
  workspaces?: {
    query: any;
    pagination?: {
      page?: number;
      limit?: number;
    };
    sort?: any;
  };
  automations?: {
    format: any;
    query: any;
  };
}

export async function initExtractDSUL(
  dsulStorage: DSULStorage,
  accessManager: AccessManager,
  opts: Options
) {
  const authorizedAccessManager = await getSuperAdmin(accessManager);
  const { page: workspacePage = 0, limit: workspaceLimit = 50 } =
    opts?.workspaces?.pagination || {};
  const [allWorkspaces] = await Promise.all([
    // authorizedAccessManager.findAll(
    //   SubjectType.Page,
    //   {},
    //   {
    //     pagination: {
    //       limit: 3000,
    //     },
    //   }
    // ),
    authorizedAccessManager.findAll(
      SubjectType.Workspace,
      {
        name: {
          $ne: 'Workspace',
        },
        ...opts?.workspaces?.query,
      },
      {
        pagination: {
          limit: workspaceLimit,
          page: workspacePage,
        },
        sort: opts?.workspaces?.sort || {},
      }
    ),
  ]);

  const workspaceIds = new Set();
  const automations = (
    await Promise.all(
      allWorkspaces.flatMap(async (workspace) => {
        try {
          const runtimeModel = await dsulStorage.get({
            dsulType: DSULType.RuntimeModel,
            workspaceId: workspace.id,
          });
          const automations = Object.entries(runtimeModel?.automations || {})
            .map(([slug, automation]) => ({ ...automation, slug }))
            .filter((automation) => {
              if (!automation?.do?.length && !automation?.output?.length) {
                return false;
              }
              if (
                opts?.automations?.query?.['description.length'] &&
                !automation?.description?.length
              ) {
                return false;
              }
              return true;
            });
          if (!opts?.automations?.format) {
            return automations;
          }
          workspaceIds.add(workspace.id);
          return automations.map((automation) =>
            interpolate(opts?.automations?.format, {
              automation,
              workspace,
            })
          );
        } catch (err) {
          logger.warn({
            msg: `Could not retrieve runtime model for workspace ${workspace.id}`,
            err,
          });
          return [];
        }
      })
    )
  ).flat();
  return {
    page: workspacePage,
    workspacesCount: workspaceIds.size,
    automationsCount: automations.length,
    automations,
  };
}
