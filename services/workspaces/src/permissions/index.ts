import { Schema } from 'mongoose';
import {
  AccessManager as GenericAccessManager,
  AccessManagerOptions,
} from '@prisme.ai/permissions';
import { ActionType, SubjectType, Role, config } from './config';

export { SubjectType, Role, ActionType };

export type SubjectInterfaces = {
  [SubjectType.Workspace]: {
    id: string;
    name: string;
    photo?: string;
    description?: Prismeai.LocalizedText;
  };
  [SubjectType.App]: Prismeai.App;
  [SubjectType.Page]: Prismeai.Page;
  [SubjectType.File]: Omit<Prismeai.File, 'url'>;
};

export type AccessManager = GenericAccessManager<
  SubjectType,
  SubjectInterfaces,
  Prismeai.Role | Role.SuperAdmin
>;

export function initAccessManager(storage: AccessManagerOptions['storage']) {
  return new GenericAccessManager<
    SubjectType,
    SubjectInterfaces,
    Prismeai.Role | Role.SuperAdmin
  >(
    {
      storage,
      schemas: {
        [SubjectType.Workspace]: {
          name: String,
          photo: String,
          description: Schema.Types.Mixed,
        },
        [SubjectType.App]: {
          workspaceId: { type: String, index: true },
          versions: Schema.Types.Mixed,
          description: Schema.Types.Mixed,
          name: { type: String, text: true },
          photo: String,
          slug: { type: String, index: true },
        },
        [SubjectType.Page]: {
          workspaceId: { type: String, index: true },
          name: Schema.Types.Mixed,
          description: Schema.Types.Mixed,
          blocks: Schema.Types.Mixed,
          slug: { type: String, sparse: true, unique: true },
          styles: { type: String },
        },
        [SubjectType.File]: {
          workspaceId: { type: String, index: true },
          name: { type: String, text: true },
          size: Number,
          mimetype: String,
          path: String,
          expiresAt: { type: String },
          expiresAfter: { type: Number },
          metadata: Schema.Types.Mixed,
        },
      },
    },
    config
  );
}

export async function getSuperAdmin(baseAccessManager: AccessManager) {
  return await baseAccessManager.as({
    id: 'api',
    sessionId: 'adminSession',
    role: Role.SuperAdmin,
  });
}
