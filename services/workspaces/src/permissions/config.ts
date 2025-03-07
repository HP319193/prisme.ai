import {
  ActionType as NativeActionType,
  NativeSubjectType,
  PermissionsConfig,
} from '@prisme.ai/permissions';
import {
  LAST_CUSTOM_RULE_PRIORITY,
  PLATFORM_WORKSPACE_ID,
  UPLOADS_STORAGE_TYPE,
  WORKSPACE_SECRET_USER_REGEX,
} from '../../config';
import { DriverType } from '../storage/types';

export const ActionType = {
  ...NativeActionType,
  GetAppSourceCode: 'read_app_dsul',
  ManageSecurity: 'manage_security',
  ManageRepositories: 'manage_repositories',
  GetUsage: 'get_usage',
  AggregateSearch: 'aggregate_search',
  Execute: 'execute',
  Test: 'test',
};

export enum SubjectType {
  Workspace = 'workspaces',
  App = 'apps',
  Page = 'pages',
  File = 'files',
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

  // Page user can :
  // 1. Access page and play with it
  PageUser = 'page-user',
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
    [SubjectType.App]: {
      author: {
        // App permissions should only be indicated by parent workspace permissions
        disableManagePolicy: true,
      },
    },
    [SubjectType.Page]: {
      author: {
        // Page permissions should only be indicated by parent workspace permissions
        disableManagePolicy: true,
      },
    },
    [SubjectType.File]: {
      author: {
        // File permissions should only be indicated by parent workspace permissions
        disableManagePolicy: true,
      },
    },

    [SubjectType.Secret]: {
      author: {
        // Secret permissions should only be indicated by parent workspace permissions
        disableManagePolicy: true,
      },
    },
  },
  rbac: [
    {
      name: Role.SuperAdmin,
      rules: [
        {
          action: ActionType.Manage,
          subject: [
            SubjectType.Workspace,
            SubjectType.App,
            SubjectType.File,
            SubjectType.Page,
            NativeSubjectType.Roles,
            SubjectType.Secret,
          ],
          priority: LAST_CUSTOM_RULE_PRIORITY + 1000,
        },
      ],
    },
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
        {
          action: [ActionType.Manage],
          subject: SubjectType.File,
          conditions: {
            workspaceId: '${subject.id}',
          },
        },
        {
          action: ActionType.Manage,
          subject: NativeSubjectType.Roles,
          conditions: {
            subjectId: '${subject.id}',
            subjectType: 'workspaces',
          },
        },
        {
          action: [ActionType.Manage],
          subject: SubjectType.Secret,
          conditions: {
            workspaceId: '${subject.id}',
            name: {
              $regex: WORKSPACE_SECRET_USER_REGEX,
            },
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
          reason: 'Native Workspace Editor',
          conditions: {
            // This role only applies to a specific workspace !
            id: '${subject.id}',
          },
        },
        {
          action: [
            ActionType.Update,
            ActionType.Read,
            ActionType.GetAppSourceCode,
          ],
          reason: 'Native Workspace Editor',
          subject: SubjectType.App,
          conditions: {
            workspaceId: '${subject.id}',
          },
        },
        {
          action: [ActionType.Update, ActionType.Read],
          subject: SubjectType.Page,
          reason: 'Native Workspace Editor',
          conditions: {
            workspaceId: '${subject.id}',
          },
        },
        {
          action: [ActionType.Manage],
          subject: SubjectType.File,
          reason: 'Native Workspace Editor',
          conditions: {
            workspaceId: '${subject.id}',
          },
        },
      ],
    },

    {
      name: Role.Owner,
      subjectType: SubjectType.Page,
      rules: [
        {
          action: ActionType.Manage,
          subject: SubjectType.Page,
          conditions: {
            // This role only applies to a specific workspace !
            id: '${subject.id}',
          },
        },
      ],
    },

    {
      name: Role.Owner,
      subjectType: SubjectType.App,
      rules: [
        {
          action: ActionType.Manage,
          subject: SubjectType.App,
          conditions: {
            // This role only applies to a specific workspace !
            id: '${subject.id}',
          },
        },
      ],
    },

    {
      name: Role.Owner,
      subjectType: SubjectType.File,
      rules: [
        {
          action: ActionType.Manage,
          subject: SubjectType.File,
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
    {
      action: ActionType.Read,
      subject: SubjectType.App,
    },
    {
      action: ActionType.Create,
      subject: SubjectType.File,
      conditions: {
        workspaceId: PLATFORM_WORKSPACE_ID,
      },
    },
  ],
};

// Kep retrocompatibility with files uploaded before private files feature so they are still readables
if (UPLOADS_STORAGE_TYPE == DriverType.FILESYSTEM) {
  config.abac.push({
    action: ActionType.Read,
    subject: SubjectType.File,
    conditions: {
      public: {
        $exists: false,
      },
    },
  });
}
