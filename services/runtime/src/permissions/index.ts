import { Broker } from '@prisme.ai/broker';
import {
  AccessManager as GenericAccessManager,
  AccessManagerOptions,
} from '@prisme.ai/permissions';
import { EventType } from '../eda';
import { config, Role, SubjectType, ActionType } from './config';
import { APP_NAME } from '../../config';
import { Schema } from 'mongoose';

export { SubjectType, Role, ActionType };

type SubjectInterfaces = {
  [SubjectType.Workspace]: {
    id: string;
    name?: string;
    slug?: string;
    registerWorkspace?: boolean;
  };
  [SubjectType.Automation]: Prismeai.Automation;
  [SubjectType.Secret]: {
    id: string;
    name: string;
    workspaceId: string;
    description?: string;
    value: any;
    type: 'string' | 'number' | 'object' | 'boolean';
  };
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
          slug: { type: String, index: true, unique: true, sparse: true },
          registerWorkspace: Boolean,
        },
        [SubjectType.Automation]: false,
        [SubjectType.Secret]: {
          workspaceId: { type: String, index: true },
          name: { type: String, text: true },
          description: Schema.Types.Mixed,
          type: { type: String },
          value: Schema.Types.Mixed,
        },
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

      // Clear both role & apiKeys caches
      await Promise.all([
        superAdmin.pullRole({
          subjectType: SubjectType.Workspace,
          subjectId: event.source.workspaceId,
        }),
        superAdmin.pullRole(
          {
            subjectType: SubjectType.Workspace,
            subjectId: event.source.workspaceId,
            type: 'apiKey',
          },
          {
            cacheKey: `subjectType:${SubjectType.Workspace},subjectId:${event.source.workspaceId},type:apiKey`,
          }
        ),
      ]);
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
