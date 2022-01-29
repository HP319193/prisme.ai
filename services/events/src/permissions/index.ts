import { PrismeEvent } from "@prisme.ai/broker";
import {
  AccessManager as GenericAccessManager,
  AccessManagerOptions,
  ActionType,
} from "@prisme.ai/permissions";
import { SubjectType, Role, config } from "./config";

export { SubjectType, Role, ActionType };

type SubjectInterfaces = {
  [SubjectType.Workspace]: { id: string; name: string };
  [SubjectType.Event]: Prismeai.PrismeEvent | PrismeEvent;
};

export type AccessManager = GenericAccessManager<
  SubjectType,
  SubjectInterfaces
>;

export function initAccessManager(storage: AccessManagerOptions["storage"]) {
  return new GenericAccessManager<SubjectType, SubjectInterfaces>(
    {
      storage,
      schemas: {
        workspace: {
          name: String,
        },
        event: false,
      },
    },
    config
  );
}
