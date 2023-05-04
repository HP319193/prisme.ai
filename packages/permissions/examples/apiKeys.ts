import { ActionType, PermissionsConfig } from '..';

export enum SubjectType {
  User = 'user',
  Workspace = 'workspace',
  Page = 'page',
  Event = 'event',
  Platform = 'platform',
}

export enum Role {
  Owner = 'owner',
  Collaborator = 'collaborator',
  Guest = 'guest',
}

const config: PermissionsConfig<SubjectType, Role, Prismeai.ApiKeyRules> = {
  subjects: Object.values(SubjectType).reduce(
    (subjects, cur) => ({
      ...subjects,
      [cur]:
        cur === SubjectType.Workspace
          ? { author: { assignRole: Role.Owner } }
          : {},
    }),
    {} as any
  ),
  rbac: [
    {
      name: Role.Owner,
      rules: [],
    },

    {
      name: Role.Guest,
      rules: [],
    },

    {
      name: Role.Collaborator,
      rules: [],
    },
  ],
  abac: [],
  customRulesBuilder: ({ type, subjectType, subjectId, rules }) => {
    if (type !== 'apiKey') {
      throw new Error('Unsupported custom role type ' + type);
    }

    if (subjectType === SubjectType.Workspace) {
      return [
        {
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            type: {
              $in: rules.events,
            },
            'source.workspaceId': subjectId,
          },
        },
      ];
    }
    throw new Error('Unsupported api key');
  },
};

export default config;
