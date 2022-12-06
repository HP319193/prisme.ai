import { createContext } from 'react';
import { Workspace } from '@prisme.ai/sdk';
import { ValidationError } from '../../utils/yaml';
import { useContext } from '../../utils/useContext';

export interface WorkspaceLayoutContext {
  displaySource: (status: boolean) => void;
  sourceDisplayed: boolean;
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
  dirty: boolean;
  setDirty: (bool: boolean) => void;
  createAutomation: () => void;
  createPage: () => void;
  installApp: () => void;
}

export const workspaceLayoutContext = createContext<
  WorkspaceLayoutContext | undefined
>(undefined);

export const useWorkspaceLayout = () =>
  useContext<WorkspaceLayoutContext>(workspaceLayoutContext);

export default workspaceLayoutContext;
