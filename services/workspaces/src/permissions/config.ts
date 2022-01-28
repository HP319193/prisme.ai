import { PermissionsConfig, ActionType } from "@prisme.ai/permissions";

export enum SubjectType {
  Workspace = "workspace",
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
          action: ActionType.Manage,
          subject: SubjectType.Workspace,
          conditions: {
            // This role only applies to a specific workspace !
            id: "${subject.id}",
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
      ],
    },
  ],
  abac: [
    // Those who can't create workspace will be blocked by gateway api on POST
    {
      action: ActionType.Create,
      subject: SubjectType.Workspace,
    },
  ],
};
