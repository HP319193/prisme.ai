import { PermissionsConfig, ActionType } from "@prisme.ai/permissions";

export enum SubjectType {
  Workspace = "workspace",
  Event = "event",
}

export enum Role {
  Admin = "admin",
  Collaborator = "collaborator",
}

export const config: PermissionsConfig<SubjectType> = {
  subjectTypes: Object.values(SubjectType),
  rbac: [
    {
      name: Role.Admin,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            // This role only applies to a specific workspace !
            "source.workspaceId": "${subject.id}",
          },
        },
      ],
    },

    {
      name: Role.Collaborator,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            // This role only applies to a specific workspace !
            "source.workspaceId": "${subject.id}",
          },
        },
      ],
    },
  ],
  abac: [],
};
