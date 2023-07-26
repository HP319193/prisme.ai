import { Broker } from '@prisme.ai/broker';
import {
  AccessManager as GenericAccessManager,
  AccessManagerOptions,
} from '@prisme.ai/permissions';
import { EventType } from '../eda';
import { config, Role, SubjectType, ActionType } from './config';
import { APP_NAME } from '../../config';

export { SubjectType, Role, ActionType };

type SubjectInterfaces = {
  [SubjectType.Workspace]: { id: string; name?: string };
  [SubjectType.Automation]: Prismeai.Automation;
};

export type AccessManager = GenericAccessManager<
  SubjectType,
  SubjectInterfaces,
  Prismeai.Role | Role.SuperAdmin
>;

export function initAccessManager(
  storage: AccessManagerOptions['storage'],
  broker: Broker
) {
  const accessManager = new GenericAccessManager<
    SubjectType,
    SubjectInterfaces,
    Prismeai.Role | Role.SuperAdmin
  >(
    {
      appName: `${process.env.HOSTNAME || APP_NAME}-permissions`,
      storage,
      rbac: {
        cacheCustomRoles: true,
        enabledSubjectTypes: [SubjectType.Workspace],
      },
      schemas: {
        [SubjectType.Workspace]: {
          name: String,
        },
        [SubjectType.Automation]: false,
      },
    },
    config
  );

  // Synchronize custom roles caches
  let superAdmin: Required<AccessManager>;
  getSuperAdmin(accessManager).then(
    (accessManager) => (superAdmin = accessManager)
  );
  broker.on<Prismeai.UpdatedWorkspaceSecurity['payload']>(
    EventType.UpdatedWorkspaceSecurity,
    async (event) => {
      if (
        !event.source.workspaceId ||
        !event.payload?.security?.authorizations
      ) {
        return true;
      }
      await superAdmin.pullRole({
        subjectType: SubjectType.Workspace,
        subjectId: event.source.workspaceId,
      });
      return true;
    },
    {
      GroupPartitions: false,
    }
  );

  return accessManager;
}

export async function getSuperAdmin(baseAccessManager: AccessManager) {
  return await baseAccessManager.as({
    id: 'api',
    sessionId: 'adminSession',
    role: Role.SuperAdmin,
  });
}
