import {
  ActionType as NativeActionType,
  PermissionsConfig,
} from '@prisme.ai/permissions';
import {
  LAST_CUSTOM_RULE_PRIORITY,
  RUNTIME_EMITS_BROKER_TOPIC,
} from '../../config';

export const ActionType = {
  ...NativeActionType,
  GetUsage: 'get_usage',
  AggregateSearch: 'aggregate_search',
};

export enum SubjectType {
  Workspace = 'workspaces',
  Event = 'events',
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

// This role only applies to a specific workspace !
const workspaceFilter = {
  'source.workspaceId': '${subject.id}',
};
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
    [SubjectType.Event]: {},
  },
  rbac: [
    {
      name: Role.SuperAdmin,
      rules: [
        {
          action: ActionType.Manage,
          subject: SubjectType.Event,
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
          action: [ActionType.Create],
          subject: SubjectType.Event,
          conditions: {
            ...workspaceFilter,
            'source.serviceTopic': RUNTIME_EMITS_BROKER_TOPIC,
          },
        },
        {
          action: [ActionType.Read],
          subject: SubjectType.Event,
          conditions: workspaceFilter,
        },
        {
          action: [ActionType.GetUsage, ActionType.AggregateSearch],
          subject: SubjectType.Workspace,
          conditions: {
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
          action: [ActionType.Create],
          subject: SubjectType.Event,
          conditions: {
            ...workspaceFilter,
            'source.serviceTopic': RUNTIME_EMITS_BROKER_TOPIC,
          },
        },
        {
          action: [ActionType.Read],
          subject: SubjectType.Event,
          conditions: workspaceFilter,
        },
        {
          action: [ActionType.GetUsage, ActionType.AggregateSearch],
          subject: SubjectType.Workspace,
          conditions: {
            id: '${subject.id}',
          },
        },
        {
          inverted: true,
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            type: {
              $regex: '^apikeys\\..*$',
            },
            // This role only applies to a specific workspace !
            'source.workspaceId': '${subject.id}',
          },
        },
      ],
    },
  ],
  abac: [
    {
      action: [ActionType.Read],
      subject: SubjectType.Event,
      conditions: {
        'source.userId': '${user.id}',
        'source.serviceTopic': 'topic:runtime:emit',
      },
    },

    {
      action: [ActionType.Read],
      subject: SubjectType.Event,
      conditions: {
        'target.userTopic': {
          $in: '${user.topics}',
        },
      },
    },

    {
      action: [ActionType.Read],
      subject: SubjectType.Event,
      conditions: {
        'target.userId': '${user.id}',
      },
    },

    {
      action: [ActionType.Read],
      subject: SubjectType.Event,
      conditions: {
        'target.sessionId': '${user.sessionId}',
      },
    },

    // Nobody should read contexts synchronization events
    {
      inverted: true,
      action: [ActionType.Create, ActionType.Read],
      subject: SubjectType.Event,
      conditions: {
        type: 'runtime.contexts.updated',
      },
      priority: LAST_CUSTOM_RULE_PRIORITY + 1000,
    },
  ],
};
