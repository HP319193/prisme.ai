import {
  ActionType as NativeActionType,
  PermissionsConfig,
} from '@prisme.ai/permissions';
import { LAST_CUSTOM_RULE_PRIORITY } from '../../config';

export const ActionType = {
  ...NativeActionType,
  Execute: 'execute',
  Test: 'test',
};

export enum SubjectType {
  Workspace = 'workspaces',
  Automation = 'automations',
  Secret = 'secrets',
}

export enum Role {
  // Internal role with full privileges
  SuperAdmin = 'superadmin',

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
  Prismeai.Role | Role.SuperAdmin
> = {
  subjects: {
    [SubjectType.Workspace]: {
      author: {
        assignRole: Role.Owner,
      },
    },
    [SubjectType.Automation]: {},
    [SubjectType.Secret]: {},
  },
  rbac: [
    {
      name: Role.SuperAdmin,
      rules: [
        {
          action: [ActionType.Execute, ActionType.Test],
          subject: SubjectType.Automation,
          priority: LAST_CUSTOM_RULE_PRIORITY + 1000,
        },
        {
          action: ActionType.Manage,
          subject: SubjectType.Workspace,
          priority: LAST_CUSTOM_RULE_PRIORITY + 1000,
        },
      ],
    },
    {
      name: Role.Owner,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: [ActionType.Execute, ActionType.Test],
          subject: SubjectType.Automation,
          conditions: {
            runningWorkspaceId: '${subject.id}',
          },
        },
      ],
    },

    {
      name: Role.Editor,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: [ActionType.Execute, ActionType.Test],
          subject: SubjectType.Automation,
          conditions: {
            runningWorkspaceId: '${subject.id}',
          },
        },
      ],
    },
  ],
  abac: [
    {
      action: [ActionType.Execute],
      subject: SubjectType.Automation,
      conditions: {
        'authorizations.action': {
          $exists: false,
        },
      },
    },
  ],
};
