import { PermissionsConfig, ActionType } from "..";

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

const config: PermissionsConfig<SubjectType, Role, Prismeai.ApiKeyRules> = {
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
  customRulesBuilder: ({ type, subjectType, subjectId, rules }) => {
    if (type !== "apiKey") {
      throw new Error("Unsupported custom role type " + type);
    }

    if (subjectType === SubjectType.Workspace) {
      return [
        {
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            type: {
              $in: rules.events,
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
