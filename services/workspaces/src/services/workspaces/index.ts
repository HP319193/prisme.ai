import { Broker } from '@prisme.ai/broker';
import { Apps } from '..';
import { EventType } from '../../eda';
import { logger } from '../../logger';
import { getSuperAdmin, AccessManager } from '../../permissions';
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
      if (
        !workspaceId ||
        !event.payload?.contexts ||
        !event.payload?.contexts?.config
      ) {
        return true;
      }

      const updatedConfig = event.payload.contexts.config;
      try {
        const workspaces = new Workspaces(
          superAdmin,
          apps,
          broker.child(event.source),
          workspaceStorage
        );
        if (appInstanceFullSlug) {
          await workspaces.appInstances.configureApp(
            workspaceId!,
            appInstanceFullSlug!,
            {
              config: updatedConfig,
            }
          );
        } else {
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
