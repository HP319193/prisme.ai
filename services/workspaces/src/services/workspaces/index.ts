import { Broker } from '@prisme.ai/broker';
import { Apps } from '..';
import { EventType } from '../../eda';
import { logger } from '../../logger';
import { getSuperAdmin, AccessManager } from '../../permissions';
import { applyObjectUpdateOpLogs } from '../../utils/applyObjectUpdateOpLogs';
import DSULStorage from '../DSULStorage';
import Workspaces from './crud/workspaces';

export { default as Workspaces } from './crud/workspaces';

export async function syncWorkspacesWithConfigContexts(
  accessManager: AccessManager,
  broker: Broker,
  workspaceStorage: DSULStorage,
  appStorage: DSULStorage
) {
  const superAdmin = await getSuperAdmin(accessManager);
  const apps = new Apps(superAdmin, broker, appStorage);

  await broker.on<Prismeai.UpdatedContexts['payload']>(
    EventType.UpdatedContexts,
    async (event) => {
      const { appInstanceFullSlug, workspaceId } = event.source || {};
      const updates = event.payload?.updates.filter(
        (cur) => cur.context === 'config'
      );
      if (!workspaceId || !updates) {
        return true;
      }

      try {
        const workspaces = new Workspaces(
          superAdmin,
          apps,
          broker.child(event.source),
          workspaceStorage
        );
        const currentWorkspace = await workspaces.getWorkspace(workspaceId);

        if (appInstanceFullSlug) {
          const updatedConfig = applyObjectUpdateOpLogs(
            currentWorkspace.imports?.[appInstanceFullSlug]?.config || {},
            updates
          );
          await workspaces.appInstances.configureApp(
            workspaceId!,
            appInstanceFullSlug!,
            {
              config: updatedConfig,
            }
          );
        } else {
          const updatedConfig = applyObjectUpdateOpLogs(
            currentWorkspace.config?.value || {},
            updates
          );
          await workspaces.configureWorkspace(workspaceId, updatedConfig);
        }
      } catch (error) {
        logger.error(error);
        return false;
      }

      return true;
    },
    {}
  );
}
