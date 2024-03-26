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
  createAutomation: (
    values: Pick<Prismeai.Automation, 'slug' | 'name'>
  ) => Promise<boolean>;
  createPage: (
    options?: { slug?: string; public?: true } & Partial<Prismeai.Page>
  ) => Promise<boolean>;
  installApp: () => void;
  createBlock: (values: {
    slug: string;
    name: Prismeai.LocalizedText;
  }) => Promise<boolean>;
  advancedMode: boolean;
  setAdvancedMode: (advancedMode: boolean) => void;
}

export const workspaceLayoutContext = createContext<
  WorkspaceLayoutContext | undefined
>(undefined);

export const useWorkspaceLayout = () =>
  useContext<WorkspaceLayoutContext>(workspaceLayoutContext);

export default workspaceLayoutContext;
