import { Broker } from '@prisme.ai/broker';
import { AppInstances, Apps } from '..';
import { EventType } from '../../eda';
import { logger } from '../../logger';
import { getSuperAdmin, AccessManager } from '../../permissions';
import { applyObjectUpdateOpLogs } from '../../utils/applyObjectUpdateOpLogs';
import { DSULStorage } from '../dsulStorage';
import Workspaces from './crud/workspaces';

export async function syncWorkspacesWithConfigContexts(
  accessManager: AccessManager,
  broker: Broker,
  dsulStorage: DSULStorage
) {
  const superAdmin = await getSuperAdmin(accessManager);
  const apps = new Apps(superAdmin, broker, dsulStorage);

  await broker.on<Prismeai.UpdatedContexts['payload']>(
    EventType.UpdatedContexts,
    async (event) => {
      const { appInstanceFullSlug, workspaceId } = event.source || {};
      const updates = event.payload?.updates.filter(
        (cur) => cur.context === 'config'
      );
      if (!workspaceId || !updates || !updates.length) {
        return true;
      }

      try {
        const workspaces = new Workspaces(
          superAdmin,
          broker.child(event.source),
          dsulStorage
        );
        const appInstances = new AppInstances(
          superAdmin,
          broker.child(event.source),
          dsulStorage,
          apps
        );

        if (appInstanceFullSlug) {
          const appInstance = await appInstances.getAppInstance(
            workspaceId,
            appInstanceFullSlug
          );
          const updatedConfig = applyObjectUpdateOpLogs(
            appInstance?.config || {},
            updates
          );
          await appInstances.configureApp(workspaceId!, appInstanceFullSlug!, {
            config: updatedConfig,
          });
        } else {
          const workspace = await workspaces.getWorkspace(workspaceId);
          const updatedConfig = applyObjectUpdateOpLogs(
            workspace?.config?.value || {},
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
