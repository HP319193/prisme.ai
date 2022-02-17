import { createContext, useContext } from 'react';
import UserPermissions = Prismeai.UserPermissions;
import SubjectType = PrismeaiAPI.GetPermissions.Parameters.SubjectType;

export interface PermissionsContext {
  usersPermissions: Map<string, UserPermissions | null>;
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
    subjectId: string,
    subjectType: SubjectType
  ) => Promise<Map<string, UserPermissions | null>>;
}

export const workspacesContext = createContext<PermissionsContext>({
  usersPermissions: new Map(),
  // unshareWorkspaceToUser: async () => ({} as any),
  addUserPermissions: async () => ({} as UserPermissions),
  getUsersPermissions: async () =>
    new Map() as Map<string, UserPermissions | null>,
});

export const usePermissions = () => useContext(workspacesContext);

export default workspacesContext;
