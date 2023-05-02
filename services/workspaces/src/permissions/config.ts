import {
  Rule,
  ActionType as NativeActionType,
  NativeSubjectType,
  PermissionsConfig,
} from '@prisme.ai/permissions';
import { LAST_CUSTOM_RULE_PRIORITY } from '../../config';

export const ActionType = {
  ...NativeActionType,
  GetAppSourceCode: 'read_app_dsul',
  ManageSecurity: 'manage_security',
  GetUsage: 'get_usage',
  AggregateSearch: 'aggregate_search',
};

export enum SubjectType {
  Workspace = 'workspaces',
  App = 'apps',
  Page = 'pages',
  File = 'files',
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
  Prismeai.Role | Role.SuperAdmin,
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
  ],
  customRulesBuilder: (role) => {
    if (role.type !== 'apiKey') {
      throw new Error('Unsupported custom role ' + JSON.stringify(role));
    }
    let rules = [];
    if (role.subjectType === SubjectType.Workspace) {
      if (role?.rules?.uploads) {
        const uploadsRule: Rule = {
          action: [ActionType.Create, ActionType.Read, ActionType.Delete],
          subject: SubjectType.File,
          conditions: {
            workspaceId: role.subjectId,
          },
        };

        if (role.rules.uploads?.mimetypes?.length) {
          const escapedAllowedUploads = (
            role.rules.uploads?.mimetypes || []
          ).map((cur) => cur.replace(/[*]/g, '.*'));

          const allowedUploadsRegex = `^(${escapedAllowedUploads.join('|')})$`;

          uploadsRule.conditions = {
            ...uploadsRule.conditions,
            mimetype: {
              $regex: allowedUploadsRegex,
            },
          };
        }
        rules.push(uploadsRule);
      }
    }

    return rules;
  },
};
