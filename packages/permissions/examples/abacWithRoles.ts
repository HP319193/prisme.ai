import { PermissionsConfig } from '..';
import abac from './abac';
import roles, { Role } from './roles';

export enum SubjectType {
  User = 'user',
  Workspace = 'workspace',
  Page = 'page',
  Event = 'event',
  Platform = 'platform',
}

const config: PermissionsConfig<SubjectType, Role> = {
  subjects: roles.subjects,
  rbac: roles.rbac,
  abac: abac.abac,
};

export default config;
export { Role };
