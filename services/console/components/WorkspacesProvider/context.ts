import { createContext, useContext } from "react";
import { Workspace } from "../../api/types";

export interface WorkspacesContext {
  workspaces: Map<string, Workspace | null>;

  get: (name: string) => Workspace | null | undefined;
  fetch: (name: string) => Promise<Workspace | null>;
  create: (name: string) => Promise<Workspace>;
  update: (workspace: Workspace) => Promise<Workspace | null>;
  createAutomation: (
    workspace: Workspace,
    automation: Prismeai.Automation
  ) => Promise<Prismeai.Automation | null>;
  updateAutomation: (
    workspace: Workspace,
    automation: Prismeai.Automation
  ) => Promise<Prismeai.Automation> | null;
  deleteAutomation: (
    workspace: Workspace,
    automation: Prismeai.Automation
  ) => Promise<Prismeai.Automation> | null;
}

export const workspacesContext = createContext<WorkspacesContext>({
  workspaces: new Map(),
  get: () => null,
  fetch: async () => null,
  create: async () => ({} as Workspace),
  update: async () => ({} as Workspace),
  createAutomation: async () => ({} as Prismeai.Automation),
  updateAutomation: async () => ({} as Prismeai.Automation),
  deleteAutomation: async () => ({} as Prismeai.Automation),
});

export const useWorkspaces = () => useContext(workspacesContext);

export default workspacesContext;
