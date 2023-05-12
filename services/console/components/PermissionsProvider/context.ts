import { createContext, useContext } from 'react';
import { UserPermissions } from '../../utils/api';

type SubjectType = PrismeaiAPI.GetPermissions.Parameters.SubjectType;

type Roles = PrismeaiAPI.GetRoles.Responses.$200;
export interface PermissionsContext {
  usersPermissions: Map<string, UserPermissions[]>;
  roles: Roles;
  addUserPermissions: (
    subjectType: SubjectType,
    subjectId: string,
    permissions: UserPermissions
  ) => Promise<UserPermissions | null>;
  removeUserPermissions: (
    subjectType: SubjectType,
    subjectId: string,
    target: UserPermissions['target']
  ) => Promise<PrismeaiAPI.RevokePermissions.Responses.$200 | null>;
  getUsersPermissions: (
    subjectType: SubjectType,
    subjectId: string
  ) => Promise<UserPermissions[]>;
  getRoles: (subjectType: SubjectType, subjectId: string) => Promise<Roles>;
}

export const workspacesContext = createContext<PermissionsContext>({
  usersPermissions: new Map(),
  roles: [],
  removeUserPermissions: async () => ({} as any),
  addUserPermissions: async () => ({} as UserPermissions),
  getUsersPermissions: async () => [] as UserPermissions[],
  getRoles: async () => [],
});

export const usePermissions = () => useContext(workspacesContext);

export default workspacesContext;
