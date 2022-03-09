import { Schema } from 'mongoose';
import {
  AccessManager as GenericAccessManager,
  AccessManagerOptions,
  ActionType,
} from '@prisme.ai/permissions';
import { SubjectType, Role, config } from './config';

export { SubjectType, Role, ActionType };

export type SubjectInterfaces = {
  [SubjectType.Workspace]: { id: string; name: string };
  [SubjectType.App]: Prismeai.App;
  [SubjectType.Page]: Prismeai.Page;
};

export type AccessManager = GenericAccessManager<
  SubjectType,
  SubjectInterfaces,
  Prismeai.Role
>;

export function initAccessManager(storage: AccessManagerOptions['storage']) {
  return new GenericAccessManager<
    SubjectType,
    SubjectInterfaces,
    Prismeai.Role
  >(
    {
      storage,
      schemas: {
        [SubjectType.Workspace]: {
          name: String,
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
          widgets: Schema.Types.Mixed,
        },
      },
    },
    config
  );
}
