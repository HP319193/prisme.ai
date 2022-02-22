import { createContext, useContext } from 'react';
import { Workspace } from '@prisme.ai/sdk';

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
    slug: string,
    automation: Prismeai.Automation
  ) => Promise<Prismeai.Automation> | null;
  deleteAutomation: (
    workspace: Workspace,
    slug: string
  ) => Promise<Prismeai.Automation> | null;

  createPage: (
    workspace: Workspace,
    page: Prismeai.Page
  ) => Promise<Prismeai.Page | null>;
  updatePage: (
    workspace: Workspace,
    slug: string,
    page: Prismeai.Page
  ) => Promise<Prismeai.Page> | null;
  deletePage: (
    workspace: Workspace,
    slug: string
  ) => Promise<Prismeai.Page> | null;

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
  getWorkspaceUsersPermissions: async () => [] as Prismeai.PermissionsList,
  createPage: async () => ({} as Prismeai.Page),
  updatePage: async () => ({} as Prismeai.Page),
  deletePage: async () => ({} as Prismeai.Page),
});

export const useWorkspaces = () => useContext(workspacesContext);

export default workspacesContext;
