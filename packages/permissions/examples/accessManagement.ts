import { ActionType, PermissionsConfig } from '..';

export enum SubjectType {
  User = 'user',
  Workspace = 'workspace',
  Page = 'page',
  Event = 'event',
  Platform = 'platform',
}

enum Role {
  Admin = 'admin',
  Collaborator = 'collaborator',
  Guest = 'guest',
}

const config: PermissionsConfig<SubjectType, Role> = {
  subjects: Object.values(SubjectType).reduce(
    (subjects, cur) => ({
      ...subjects,
      [cur]:
        cur === SubjectType.Workspace
          ? { author: { assignRole: Role.Admin } }
          : {},
    }),
    {} as any
  ),
  rbac: [
    {
      name: Role.Admin,
      rules: [
        {
          action: ActionType.Create,
          subject: SubjectType.Workspace,
        },
        {
          action: ActionType.Create,
          subject: SubjectType.Page,
        },
        {
          action: [ActionType.Read, ActionType.Create],
          subject: SubjectType.Event,
        },
      ],
    },

    {
      name: Role.Guest,
      rules: [
        {
          inverted: true,
          action: ActionType.Manage,
          subject: SubjectType.Workspace,
        },
        {
          inverted: true,
          action: ActionType.Manage,
          subject: SubjectType.Page,
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
      inverted: true,
      action: [ActionType.Delete, ActionType.Update],
      subject: SubjectType.Event,
    },
  ],
};

export default config;
