import {
  ActionType as NativeActionType,
  PermissionsConfig,
} from '@prisme.ai/permissions';

export const ActionType = {
  ...NativeActionType,
  GetValues: 'GetValues',
};

export enum SubjectType {
  Workspace = 'workspaces',
  Event = 'events',
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
      name: Role.Owner,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: [ActionType.Create, ActionType.Read, ActionType.GetValues],
          subject: SubjectType.Event,
          conditions: {
            // This role only applies to a specific workspace !
            'source.workspaceId': '${subject.id}',
          },
        },
      ],
    },

    {
      name: Role.Editor,
      subjectType: SubjectType.Workspace,
      rules: [
        {
          action: [ActionType.Create, ActionType.Read, ActionType.GetValues],
          subject: SubjectType.Event,
          conditions: {
            // This role only applies to a specific workspace !
            'source.workspaceId': '${subject.id}',
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
      action: [ActionType.Read, ActionType.GetValues],
      subject: SubjectType.Event,
      conditions: {
        'target.userTopic': {
          $in: '${user.topics}',
        },
      },
    },

    {
      action: [ActionType.Read, ActionType.GetValues],
      subject: SubjectType.Event,
      conditions: {
        'target.userId': '${user.id}',
      },
    },

    {
      action: [ActionType.Read, ActionType.GetValues],
      subject: SubjectType.Event,
      conditions: {
        'target.sessionId': '${user.sessionId}',
      },
    },
  ],
  customRulesBuilder: (role) => {
    if (role.type !== 'apiKey') {
      throw new Error('Unsupported custom role ' + JSON.stringify(role));
    }

    if (role.subjectType === SubjectType.Workspace) {
      if (!role?.rules?.events) {
        return [];
      }
      const { types, filters } = role.rules.events;

      const escapedAllowedEvents = (types || []).map((cur) =>
        cur.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/[*]/g, '.*')
      );
      const allowedEventsRegex = `^(${escapedAllowedEvents.join('|')})$`;

      return [
        {
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            type: {
              $regex: allowedEventsRegex,
            },
            ...filters,
            'source.workspaceId': role.subjectId,
          },
        },
      ];
    }
    throw new Error('Unsupported api key');
  },
};
