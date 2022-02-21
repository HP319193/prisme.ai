import { Broker, PrismeEvent } from '@prisme.ai/broker';
import {
  AccessManager as GenericAccessManager,
  AccessManagerOptions,
  ActionType,
  EventType as PermissionsEventType,
} from '@prisme.ai/permissions';
import { config, Role, SubjectType } from './config';

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

export function initAccessManager(
  storage: AccessManagerOptions['storage'],
  broker: Broker
) {
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

  broker.on<Prismeai.CreatedApiKey['payload']>(
    [PermissionsEventType.CreatedApiKey, PermissionsEventType.UpdatedApiKey],
    async (event) => {
      const { apiKey, subjectType, subjectId, rules } = event.payload || {};
      const user = await accessManager.as({ id: event.source.userId!! });
      await user.updateApiKey(
        apiKey!!,
        subjectType as SubjectType,
        subjectId!!,
        rules
      );
      return true;
    }
  );

  broker.on<Prismeai.DeletedApiKey['payload']>(
    PermissionsEventType.DeletedApiKey,
    async (event) => {
      const { apiKey, subjectType, subjectId } = event.payload || {};
      const user = await accessManager.as({ id: event.source.userId!! });
      await user.deleteApiKey(
        apiKey!!,
        subjectType as SubjectType,
        subjectId!!
      );
      return true;
    }
  );

  return accessManager;
}
