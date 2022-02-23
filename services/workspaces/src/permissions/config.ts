import { PermissionsConfig, ActionType } from '@prisme.ai/permissions';

export enum SubjectType {
  Workspace = 'workspaces',
  App = 'apps',
  Page = 'pages',
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

  // Page user can :
  // 1. Access page and play with it
  PageUser = 'page-user',
}

export const config: PermissionsConfig<
  SubjectType,
  Prismeai.Role,
  Prismeai.ApiKeyRules
> = {
  subjects: {
    [SubjectType.Workspace]: {
      author: {
        assignRole: Role.Owner,
      },
    },
    [SubjectType.App]: {
      author: {
        // App permissions should only be indicated by parent workspace permissions
        disableManagePolicy: true,
      },
    },
    [SubjectType.Page]: {
      author: {
        // App permissions should only be indicated by parent workspace permissions
        disableManagePolicy: true,
      },
    },
  },
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
        {
          action: ActionType.Manage,
          subject: SubjectType.App,
          conditions: {
            workspaceId: '${subject.id}',
          },
        },
        {
          action: ActionType.Manage,
          subject: SubjectType.Page,
          conditions: {
            workspaceId: '${subject.id}',
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
        {
          action: [ActionType.Update, ActionType.Read],
          subject: SubjectType.App,
          conditions: {
            workspaceId: '${subject.id}',
          },
        },
        {
          action: [ActionType.Update, ActionType.Read],
          subject: SubjectType.Page,
          conditions: {
            workspaceId: '${subject.id}',
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
    {
      action: ActionType.Read,
      subject: SubjectType.App,
    },
  ],
  customRulesBuilder: (role) => {
    return [];
  },
};
