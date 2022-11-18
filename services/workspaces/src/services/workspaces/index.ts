import { Broker } from '@prisme.ai/broker';
import { Apps } from '..';
import { EventType } from '../../eda';
import { logger } from '../../logger';
import { getSuperAdmin, AccessManager } from '../../permissions';
import { applyObjectUpdateOpLogs } from '../../utils/applyObjectUpdateOpLogs';
import DSULStorage, { DSULType } from '../DSULStorage';
import Workspaces from './crud/workspaces';

export { default as Workspaces } from './crud/workspaces';
export { default as Automations } from './crud/automations';
export { default as Pages } from './crud/pages';
export { default as AppInstances } from './crud/appInstances';

export async function syncWorkspacesWithConfigContexts(
  accessManager: AccessManager,
  broker: Broker,
  workspacesStorage: DSULStorage,
  appsStorage: DSULStorage
) {
  const superAdmin = await getSuperAdmin(accessManager);
  const apps = new Apps(superAdmin, broker, appsStorage);

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
          apps,
          broker.child(event.source),
          workspacesStorage
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
