import { Loading } from '@prisme.ai/design-system';
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import api from '../../utils/api';

interface Workspace extends Prismeai.DSULReadOnly {
  id: string;
}

export interface WorkspaceContext {
  workspace: Workspace;
  loading: boolean;
  fetchWorkspace: () => void;
  saveWorkspace: (
    workspace: Prismeai.Workspace
  ) => Promise<Prismeai.Workspace | null>;
  saving: boolean;
  deleteWorkspace: () => Promise<Prismeai.Workspace | null>;
  createAutomation: (
    automation: Prismeai.Automation
  ) => Promise<Prismeai.Automation | null>;
  createPage: (page: Prismeai.Page) => Promise<Prismeai.Page | null>;
  installApp: (
    app: Prismeai.AppInstance
  ) => Promise<Prismeai.AppInstance | null>;
}

interface WorkspaceProviderProps {
  id: string;
  onUpdate?: (workspace: Workspace) => void;
  children: ReactNode;
}

export const workspaceContext = createContext<WorkspaceContext>({
  workspace: {} as Workspace,
  loading: true,
  fetchWorkspace() {},
  async saveWorkspace() {
    return {} as Prismeai.DSULReadOnly;
  },
  saving: false,
  async deleteWorkspace() {
    return {} as Prismeai.Workspace;
  },
  async createAutomation() {
    return {} as Prismeai.Automation;
  },
  async createPage() {
    return {} as Prismeai.Page;
  },
  async installApp() {
    return {} as Prismeai.AppInstance;
  },
});

export const useWorkspace = () => useContext(workspaceContext);

export const WorkspaceProvider = ({
  id,
  onUpdate,
  children,
}: WorkspaceProviderProps) => {
  const [workspace, setWorkspace] = useState<WorkspaceContext['workspace']>();
  const [loading, setLoading] = useState<WorkspaceContext['loading']>(true);
  const [saving, setSaving] = useState<WorkspaceContext['saving']>(false);

  useEffect(() => {
    onUpdate && workspace && onUpdate(workspace);
  }, [workspace, onUpdate]);

  const fetchWorkspace: WorkspaceContext['fetchWorkspace'] = useCallback(async () => {
    const workspace = await api.getWorkspace(id);
    if (workspace && workspace.id) {
      setWorkspace(workspace as Workspace);
    }
  }, [id]);

  const saveWorkspace: WorkspaceContext['saveWorkspace'] = useCallback(
    async (data) => {
      if (!workspace?.id) return null;
      setSaving(true);
      const newWorkspace = {
        ...workspace,
        ...(await api.updateWorkspace({
          ...data,
          id: workspace.id,
        })),
      };
      setWorkspace(newWorkspace);
      setSaving(false);
      return newWorkspace as Prismeai.Workspace;
    },
    [workspace]
  );

  const deleteWorkspace: WorkspaceContext['deleteWorkspace'] = useCallback(async () => {
    if (!workspace?.id) return null;
    const deleted = await api.deleteWorkspace(workspace.id);
    setWorkspace(undefined);

    return deleted;
  }, [workspace]);

  const createAutomation: WorkspaceContext['createAutomation'] = useCallback(
    async (automation) => {
      if (!workspace?.id) return null;
      const newAutomation = await api.createAutomation(
        workspace.id,
        automation
      );

      setWorkspace(
        (workspace) =>
          workspace && {
            ...workspace,
            automations: {
              ...(workspace.automations || {}),
              ...(newAutomation.slug
                ? { [newAutomation.slug]: newAutomation }
                : {}),
            },
          }
      );
      fetchWorkspace();
      return newAutomation;
    },
    [fetchWorkspace, workspace]
  );

  const createPage: WorkspaceContext['createPage'] = useCallback(
    async (page) => {
      if (!workspace?.id) return null;
      const newPage = await api.createPage(workspace.id, page);
      setWorkspace(
        (workspace) =>
          workspace && {
            ...workspace,
            pages: {
              ...(workspace.pages || {}),
              ...(newPage.slug
                ? { [newPage.slug]: newPage as Prismeai.PageMeta }
                : {}),
            },
          }
      );
      fetchWorkspace();
      return newPage;
    },
    [fetchWorkspace, workspace]
  );

  const installApp: WorkspaceContext['installApp'] = useCallback(
    async (app) => {
      if (!workspace?.id) return null;
      const newApp = await api.installApp(workspace.id, app);
      setWorkspace(
        (workspace) =>
          workspace && {
            ...workspace,
            imports: {
              ...(workspace.imports || {}),
              ...(newApp.slug
                ? { [newApp.slug]: newApp as Prismeai.DetailedAppInstance }
                : {}),
            },
          }
      );
      fetchWorkspace();
      return newApp;
    },
    [fetchWorkspace, workspace]
  );

  const prevId = useRef<string>('');
  useEffect(() => {
    if (prevId.current === id) return;
    prevId.current = id;
    const initialFetch = async () => {
      setLoading(true);
      await fetchWorkspace();
      setLoading(false);
    };
    initialFetch();
  }, [fetchWorkspace, id]);

  if (loading) return <Loading />;
  if (!workspace) return null;

  return (
    <workspaceContext.Provider
      value={{
        workspace,
        loading,
        fetchWorkspace,
        saveWorkspace,
        saving,
        deleteWorkspace,
        createAutomation,
        createPage,
        installApp,
      }}
    >
      {children}
    </workspaceContext.Provider>
  );
};

export default WorkspaceProvider;
