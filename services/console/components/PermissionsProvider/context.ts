import { createContext, useContext } from 'react';

type SubjectType = PrismeaiAPI.GetPermissions.Parameters.SubjectType;
type UserPermissions = Prismeai.UserPermissions;

export interface PermissionsContext {
  usersPermissions: Map<string, UserPermissions[]>;
  addUserPermissions: (
    subjectType: SubjectType,
    subjectId: string,
    permissions: UserPermissions
  ) => Promise<PrismeaiAPI.Share.Responses.$200 | null>;
  removeUserPermissions: (
    subjectType: SubjectType,
    subjectId: string,
    userEmail: string
  ) => Promise<PrismeaiAPI.RevokePermissions.Responses.$200 | null>;
  getUsersPermissions: (
    subjectType: SubjectType,
    subjectId: string
  ) => Promise<UserPermissions[]>;
}

export const workspacesContext = createContext<PermissionsContext>({
  usersPermissions: new Map(),
  removeUserPermissions: async () => ({} as any),
  addUserPermissions: async () => ({} as UserPermissions),
  getUsersPermissions: async () => [] as UserPermissions[],
});

export const usePermissions = () => useContext(workspacesContext);

export default workspacesContext;
