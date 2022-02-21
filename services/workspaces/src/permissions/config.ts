import { ActionType, PermissionsConfig } from '@prisme.ai/permissions';

export enum SubjectType {
  Workspace = 'workspaces',
}

export enum Role {
  // Owner can :
  // 1. Manage permissions + API keys
  // 2. View all workspace events
  // 3. Has full CRUD permissions on the workspace, installed apps & pages
  Owner = 'owner',

  // Editor can :
  // 2. View all workspace events except API key & permissions ones
  // 3. Has CRUD permissions except delete on the workspace, installed apps & pages
  Editor = 'editor',
}

export const config: PermissionsConfig<
  SubjectType,
  Prismeai.Role,
  Prismeai.ApiKeyRules
> = {
  subjectTypes: Object.values(SubjectType),
  rbac: [
    {
      name: Role.Owner,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: ActionType.Manage,
          subject: SubjectType.Workspace,
          conditions: {
            // This role only applies to a specific workspace !
            id: '${subject.id}',
          },
        },
      ],
    },

    {
      name: Role.Editor,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: [ActionType.Update, ActionType.Read],
          subject: SubjectType.Workspace,
          conditions: {
            // This role only applies to a specific workspace !
            id: '${subject.id}',
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
  customRulesBuilder: (role) => {
    return [];
  },
  ownerRole: Role.Owner,
};
