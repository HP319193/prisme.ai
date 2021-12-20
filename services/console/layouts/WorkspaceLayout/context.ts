import { createContext, useContext } from "react";
import { Workspace } from "../../api/types";

export interface WorkspaceContext {
  workspace: Workspace;
  loading: boolean;
}

export const workspaceContext = createContext<WorkspaceContext>({
  workspace: {} as Workspace,
  loading: false,
});

export const useWorkspace = () => useContext(workspaceContext);

export default workspaceContext;
