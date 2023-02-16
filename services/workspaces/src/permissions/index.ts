import { Schema } from 'mongoose';
import {
  AccessManager as GenericAccessManager,
  AccessManagerOptions,
  ApiKey as GenericApiKey,
} from '@prisme.ai/permissions';
import { ActionType, SubjectType, Role, config } from './config';

type ApiKey = GenericApiKey<SubjectType.Workspace>;
export { SubjectType, Role, ActionType, ApiKey };

export interface WorkspaceMetadata {
  id: string;
  name: string;
  slug: string;
  photo?: string;
  versions?: Required<Prismeai.WorkspaceVersion>[];
  description?: Prismeai.LocalizedText;
  labels?: string[];
  customDomains?: string[];
}

export type SubjectInterfaces = {
  [SubjectType.Workspace]: WorkspaceMetadata;
  [SubjectType.App]: Prismeai.App;
  [SubjectType.Page]: Omit<Prismeai.PageMeta, 'name'> & {
    name?: Prismeai.LocalizedText;
  };
  [SubjectType.File]: Omit<Prismeai.File, 'url'>;
};

export type AccessManager = GenericAccessManager<
  SubjectType,
  SubjectInterfaces,
  Prismeai.Role | Role.SuperAdmin
>;

export function initAccessManager(storage: AccessManagerOptions['storage']) {
  const accessManager = new GenericAccessManager<
    SubjectType,
    SubjectInterfaces,
    Prismeai.Role | Role.SuperAdmin
  >(
    {
      storage,
      schemas: {
        [SubjectType.Workspace]: {
          name: { type: String, text: true },
          photo: String,
          description: Schema.Types.Mixed,
          versions: Schema.Types.Mixed,
          slug: { type: String, index: true, unique: true, sparse: true },
          labels: [String],
          customDomains: [String],
        },
        [SubjectType.App]: {
          workspaceId: { type: String, index: true },
          versions: Schema.Types.Mixed,
          description: Schema.Types.Mixed,
          name: { type: String, text: true },
          documentation: Schema.Types.Mixed,
          photo: String,
          slug: { type: String, index: true },
          labels: [String],
        },
        [SubjectType.Page]: {
          workspaceId: { type: String, index: true },
          workspaceSlug: { type: String, index: true },
          name: Schema.Types.Mixed,
          description: Schema.Types.Mixed,
          blocks: Schema.Types.Mixed,
          slug: { type: String },
          styles: { type: String },
          apiKey: { type: String },
          labels: [String],
          customDomains: [String],
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

  // Compound indices for pages
  accessManager.model(SubjectType.Page).schema.index(
    {
      workspaceSlug: 1,
      slug: 1,
    },
    {
      unique: true,
      sparse: true,
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
