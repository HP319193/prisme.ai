import { createContext } from 'react';
import { Workspace } from '@prisme.ai/sdk';
import { ValidationError } from '../../utils/yaml';
import { useContext } from '../../utils/useContext';

export enum DisplayedSourceType {
  Config = 'config',
  Roles = 'roles',
  None = 'none',
}
export interface WorkspaceLayoutContext {
  displaySource: (type: DisplayedSourceType) => void;
  sourceDisplayed: DisplayedSourceType;
  invalid: false | ValidationError[];
  setInvalid: (invalid: WorkspaceLayoutContext['invalid']) => void;
  saving: boolean;
  setSaving: (s: WorkspaceLayoutContext['saving']) => void;
  onSave: (workspace: Workspace) => void;
  onSaveSource: () => void;
  newSource?: Workspace;
  setNewSource: (fn: WorkspaceLayoutContext['newSource']) => void;
  fullSidebar: boolean;
  setFullSidebar: (s: boolean) => void;
  createAutomation: () => void;
  createPage: (options?: { slug?: string; public?: true }) => void;
  installApp: () => void;
  createBlock: () => void;
}

export const workspaceLayoutContext = createContext<
  WorkspaceLayoutContext | undefined
>(undefined);

export const useWorkspaceLayout = () =>
  useContext<WorkspaceLayoutContext>(workspaceLayoutContext);

export default workspaceLayoutContext;
