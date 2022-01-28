import { PermissionsConfig, ActionType } from "..";

export enum SubjectType {
  User = "user",
  Workspace = "workspace",
  Page = "page",
  Event = "event",
}

enum Role {
  Admin = "admin",
  Collaborator = "collaborator",
  Guest = "guest",
}

const config: PermissionsConfig<SubjectType> = {
  subjectTypes: Object.values(SubjectType),
  rbac: [
    {
      name: Role.Admin,
      rules: [
        {
          action: ActionType.Create,
          subject: SubjectType.Workspace,
        },
        {
          action: ActionType.Create,
          subject: SubjectType.Page,
        },
        {
          action: [ActionType.Read, ActionType.Create],
          subject: SubjectType.Event,
        },
      ],
    },

    {
      name: Role.Guest,
      rules: [
        {
          inverted: true,
          action: ActionType.Manage,
          subject: SubjectType.Workspace,
        },
        {
          inverted: true,
          action: ActionType.Manage,
          subject: SubjectType.Page,
        },
      ],
    },

    {
      name: Role.Collaborator,
      rules: [],
    },
  ],
  abac: [
    {
      inverted: true,
      action: [ActionType.Delete, ActionType.Update],
      subject: SubjectType.Event,
    },
  ],
};

export default config;
