import {
  AccessManager as GenericAccessManager,
  AccessManagerOptions,
  ActionType,
} from "@prisme.ai/permissions";
import { SubjectType, Role, config } from "./config";

export { SubjectType, Role, ActionType };

export type SubjectInterfaces = {
  [SubjectType.Workspace]: { id: string; name: string };
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
        [SubjectType.Workspace]: {
          name: String,
        },
      },
    },
    config
  );
}
