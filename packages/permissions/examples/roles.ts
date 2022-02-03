import { PermissionsConfig, ActionType } from "..";

export enum SubjectType {
  User = "user",
  Workspace = "workspace",
  Page = "page",
  Event = "event",
  Platform = "platform",
}

export enum Role {
  // Platform-wide roles
  WorkspaceBuilder = "workspace_builder",
  Guest = "guest",

  // Workspace roles
  Admin = "admin",
  Collaborator = "collaborator",
}

const config: PermissionsConfig<SubjectType, Role> = {
  subjectTypes: Object.values(SubjectType),
  rbac: [
    // Platform-wide roles
    {
      name: Role.WorkspaceBuilder,
      rules: [
        {
          action: ActionType.Create,
          subject: SubjectType.Workspace,
        },
      ],
    },
    {
      name: Role.Guest,
      rules: [],
    },

    // Workspace roles
    {
      name: Role.Admin,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: ActionType.Create,
          subject: SubjectType.Workspace,
        },
        {
          action: ActionType.Manage,
          subject: SubjectType.Workspace,
          conditions: {
            // This role only applies to a specific workspace !
            id: "${subject.id}",
          },
        },
        {
          action: ActionType.Manage,
          subject: SubjectType.Page,
          conditions: {
            // This role only applies to a specific workspace !
            workspaceId: "${subject.id}",
          },
        },
      ],
    },

    {
      name: Role.Collaborator,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: [ActionType.Update, ActionType.Read],
          subject: SubjectType.Workspace,
          conditions: {
            // This role only applies to a specific workspace !
            id: "${subject.id}",
          },
        },
        {
          action: [ActionType.Read, ActionType.Create, ActionType.Update],
          subject: SubjectType.Page,
          conditions: {
            // This role only applies to a specific workspace !
            workspaceId: "${subject.id}",
          },
        },
      ],
    },
  ],
  abac: [],
};

export default config;
