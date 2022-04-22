import { Broker, PrismeEvent } from '@prisme.ai/broker';
import {
  AccessManager as GenericAccessManager,
  AccessManagerOptions,
  EventType as PermissionsEventType,
} from '@prisme.ai/permissions';
import { config, Role, SubjectType, ActionType } from './config';

export { SubjectType, Role, ActionType };

type SubjectInterfaces = {
  [SubjectType.Workspace]: { id: string; name: string };
  [SubjectType.Event]: Prismeai.PrismeEvent | PrismeEvent;
};

export type AccessManager = GenericAccessManager<
  SubjectType,
  SubjectInterfaces,
  Prismeai.Role
>;

export function initAccessManager(storage: AccessManagerOptions['storage']) {
  const accessManager = new GenericAccessManager<
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
        [SubjectType.Event]: false,
      },
    },
    config
  );

  return accessManager;
}
