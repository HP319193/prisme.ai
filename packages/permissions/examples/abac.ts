import { ActionType, PermissionsConfig } from '..';

export enum SubjectType {
  User = 'user',
  Workspace = 'workspace',
  Page = 'page',
  Event = 'event',
  Platform = 'platform',
}

enum Role {
  Owner = 'owner',
  Collaborator = 'collaborator',
  Guest = 'guest',
}

const config: PermissionsConfig<SubjectType, Role> = {
  subjects: Object.values(SubjectType).reduce(
    (subjects, cur) => ({
      ...subjects,
      [cur]: {},
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
      rules: [
        {
          action: [ActionType.Create, ActionType.Read],
          subject: SubjectType.Event,
          conditions: {
            type: {
              $regex: '^apps.someAuthorizedApp.',
            },
          },
        },
      ],
    },

    {
      name: Role.Collaborator,
      rules: [],
    },
  ],
  abac: [
    {
      // Everyone can read / update its own user
      action: ActionType.Manage,
      subject: SubjectType.User,
      conditions: {
        id: '${user.id}',
      },
    },
    {
      // Everyone can read a public page
      action: ActionType.Read,
      subject: SubjectType.Page,
      conditions: {
        public: true,
      },
    },

    {
      // Hardcode owner permissions for testing
      action: [ActionType.Manage, ActionType.ManagePermissions],
      subject: [SubjectType.Workspace, SubjectType.Page],
      conditions: {
        'permissions.${user.id}.role': 'owner',
      },
    },
  ],
};

export default config;
