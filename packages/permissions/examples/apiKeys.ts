import { PermissionsConfig } from '..';

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

const config: PermissionsConfig<SubjectType, Role> = {
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
};

export default config;
