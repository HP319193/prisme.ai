import { createContext, useContext } from 'react';
import { Event, Workspace } from '../../api/types';
import Policies = Prismeai.Policies;
import UserPermissions = Prismeai.UserPermissions;

export interface WorkspacesContext {
  workspaces: Map<string, Workspace | null>;

  get: (name: string) => Workspace | null | undefined;
  fetch: (name: string) => Promise<Workspace | null>;
  create: (name: string) => Promise<Workspace>;
  update: (workspace: Workspace) => Promise<Workspace | null>;
  remove: (workspace: Pick<Workspace, 'id'>) => Promise<null>;

  createAutomation: (
    workspace: Workspace,
    automation: Prismeai.Automation
  ) => Promise<Prismeai.Automation | null>;
  updateAutomation: (
    workspace: Workspace,
    automationId: string,
    automation: Prismeai.Automation
  ) => Promise<Prismeai.Automation> | null;
  deleteAutomation: (
    workspace: Workspace,
    automationId: string
  ) => Promise<Prismeai.Automation> | null;

  // shareWorkspaceToUser: (
  //   userEmail: string,
  //   role: Policies,
  //   workspaceId: string
  // ) => Promise<any>;
  // unshareWorkspaceToUser: (
  //   userEmail: string,
  //   workspaceId: string
  // ) => Promise<any>;
  getWorkspaceUsersPermissions: (
    workspaceId: string
  ) => Promise<Prismeai.PermissionsList>;
}

export const workspacesContext = createContext<WorkspacesContext>({
  workspaces: new Map(),
  get: () => null,
  fetch: async () => null,
  create: async () => ({} as Workspace),
  update: async () => ({} as Workspace),
  remove: async () => null,
  createAutomation: async () => ({} as Prismeai.Automation),
  updateAutomation: async () => ({} as Prismeai.Automation),
  deleteAutomation: async () => ({} as Prismeai.Automation),
  // shareWorkspaceToUser: async () => ({} as any),
  // unshareWorkspaceToUser: async () => ({} as any),
  getWorkspaceUsersPermissions: async () => [] as Prismeai.PermissionsList,
});

export const useWorkspaces = () => useContext(workspacesContext);

export default workspacesContext;
