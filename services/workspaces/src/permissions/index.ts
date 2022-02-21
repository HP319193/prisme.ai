import {
  AccessManager as GenericAccessManager,
  AccessManagerOptions,
  ActionType,
} from '@prisme.ai/permissions';
import { config, Role, SubjectType } from './config';

export { SubjectType, Role, ActionType };

export type SubjectInterfaces = {
  [SubjectType.Workspace]: { id: string; name: string };
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
      },
    },
    config
  );
}
