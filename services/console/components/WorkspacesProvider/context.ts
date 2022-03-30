import { createContext, useContext } from 'react';
import { Workspace } from '@prisme.ai/sdk';

export interface WorkspacesContext {
  workspaces: Map<string, Workspace | null>;

  get: (name: string) => Workspace | null | undefined;
  fetch: (name: string) => Promise<Workspace | null>;
  create: (name: string) => Promise<Workspace>;
  update: (workspace: Workspace) => Promise<Workspace | null>;
  remove: (workspace: Pick<Workspace, 'id'>, dry?: boolean) => Promise<null>;
  getWorkspaceUsersPermissions: (
    workspaceId: string
  ) => Promise<Prismeai.PermissionsList>;

  installApp: (
    workspaceId: PrismeaiAPI.InstallAppInstance.PathParameters['workspaceId'],
    body: PrismeaiAPI.InstallAppInstance.RequestBody
  ) => Promise<Prismeai.AppInstance | null>;
  updateApp: (
    workspaceId: PrismeaiAPI.ConfigureAppInstance.PathParameters['workspaceId'],
    slug: PrismeaiAPI.ConfigureAppInstance.PathParameters['slug'],
    body: PrismeaiAPI.ConfigureAppInstance.RequestBody
  ) => Promise<any>;
  uninstallApp: (
    workspaceId: PrismeaiAPI.UninstallAppInstance.PathParameters['workspaceId'],
    slug: PrismeaiAPI.UninstallAppInstance.PathParameters['slug']
  ) => Promise<{ id: string } | null>;

  publishApp: (app: PrismeaiAPI.PublishApp.RequestBody) => Promise<any>;
}

export const workspacesContext = createContext<WorkspacesContext>({
  workspaces: new Map(),
  get: () => null,
  fetch: async () => null,
  create: async () => ({} as Workspace),
  update: async () => ({} as Workspace),
  remove: async () => null,
  getWorkspaceUsersPermissions: async () => [] as Prismeai.PermissionsList,
  installApp: async () => ({} as any),
  updateApp: async () => ({} as any),
  uninstallApp: async () => ({} as any),
  publishApp: async () => ({} as any),
});

export const useWorkspaces = () => useContext(workspacesContext);

export default workspacesContext;
