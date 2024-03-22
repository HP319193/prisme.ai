import { Broker } from '@prisme.ai/broker';
import { AppInstances, Apps } from '..';
import { EventType } from '../../eda';
import { logger } from '../../logger';
import { getSuperAdmin, AccessManager } from '../../permissions';
import { applyObjectUpdateOpLogs } from '../../utils/applyObjectUpdateOpLogs';
import { DSULStorage } from '../DSULStorage';
import { Workspaces } from './crud/workspaces';

export async function initWorkspacesConfigSyncing(
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
          const [rootAppSlug, ...nestedApps] = appInstanceFullSlug.split('.');
          const appInstance = await appInstances.getAppInstance(
            workspaceId,
            rootAppSlug
          );
          const updatedConfig = applyObjectUpdateOpLogs(
            appInstance?.config?.value || {},
            nestedApps.length
              ? // If config update comes from a nested app, initialize corresponding keys in root app config
                updates.map((cur) => ({
                  ...cur,
                  path: `${nestedApps.join('.')}.${cur.path}`,
                }))
              : updates
          );
          await appInstances.configureApp(workspaceId!, rootAppSlug!, {
            config: updatedConfig,
          });
        } else {
          const workspace = await workspaces.getWorkspace(workspaceId);
          const updatedConfig = applyObjectUpdateOpLogs(
            workspace?.config?.value || {},
            updates
          );
          await workspaces.configureWorkspace(
            workspaceId,
            updatedConfig,
            false
          );
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
