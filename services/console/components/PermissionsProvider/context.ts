import { createContext, useContext } from 'react';
import UserPermissions = Prismeai.UserPermissions;
import SubjectType = PrismeaiAPI.GetPermissions.Parameters.SubjectType;

export interface PermissionsContext {
  usersPermissions: Map<string, UserPermissions[]>;
  addUserPermissions: (
    subjectType: SubjectType,
    subjectId: string,
    permissions: UserPermissions
  ) => Promise<any>;
  // unshareWorkspaceToUser: (
  //   userEmail: string,
  //   workspaceId: string
  // ) => Promise<any>;
  getUsersPermissions: (
    subjectType: SubjectType,
    subjectId: string
  ) => Promise<UserPermissions[]>;
}

export const workspacesContext = createContext<PermissionsContext>({
  usersPermissions: new Map(),
  // unshareWorkspaceToUser: async () => ({} as any),
  addUserPermissions: async () => ({} as UserPermissions),
  getUsersPermissions: async () => [] as UserPermissions[],
});

export const usePermissions = () => useContext(workspacesContext);

export default workspacesContext;
