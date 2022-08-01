import { createContext, useContext } from 'react';
import { Workspace } from '@prisme.ai/sdk';
import { ValidationError } from '../../utils/yaml';

export interface WorkspaceLayoutContext {
  displaySource: (status: boolean) => void;
  sourceDisplayed: boolean;
  invalid: false | ValidationError[];
  setInvalid: (invalid: WorkspaceLayoutContext['invalid']) => void;
  saving: boolean;
  setSaving: (s: WorkspaceLayoutContext['saving']) => void;
  newSource?: Workspace;
  setNewSource: (fn: WorkspaceLayoutContext['newSource']) => void;
  fullSidebar: boolean;
  setFullSidebar: (s: boolean) => void;
  dirty: boolean;
  setDirty: (bool: boolean) => void;
}

export const workspaceLayoutContext = createContext<WorkspaceLayoutContext>({
  displaySource() {},
  sourceDisplayed: false,
  invalid: false,
  setInvalid() {},
  saving: false,
  setSaving() {},
  setNewSource() {},
  fullSidebar: false,
  setFullSidebar() {},
  dirty: false,
  setDirty() {},
});

export const useWorkspaceLayout = () => useContext(workspaceLayoutContext);

export default workspaceLayoutContext;
