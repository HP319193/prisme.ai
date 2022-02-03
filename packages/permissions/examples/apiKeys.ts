import { PermissionsConfig, ActionType, CustomRole } from "..";

export enum SubjectType {
  User = "user",
  Workspace = "workspace",
  Page = "page",
  Event = "event",
  Platform = "platform",
}

export enum Role {
  Admin = "admin",
  Collaborator = "collaborator",
  Guest = "guest",
}

const config: PermissionsConfig<SubjectType, Role> = {
  subjectTypes: Object.values(SubjectType),
  rbac: [
    {
      name: Role.Admin,
      rules: [],
    },

    {
      name: Role.Guest,
      rules: [],
    },

    {
      name: Role.Collaborator,
      rules: [],
    },
  ],
  abac: [],
  roleBuilder: ({ subjectType, subjectId, payload }) => {
    if (subjectType === SubjectType.Workspace) {
      return [
        {
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            type: {
              $in: payload.allowedEvents,
            },
            "source.workspaceId": subjectId,
          },
        },
      ];
    }
    throw new Error("Unsupported api key");
  },
};

export default config;
