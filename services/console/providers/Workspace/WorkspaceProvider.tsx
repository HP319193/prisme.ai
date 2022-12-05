import { Loading } from '@prisme.ai/design-system';
import {
  createContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import api from '../../utils/api';
import { useContext } from '../../utils/useContext';

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
  refreshAutomation: (automation: Prismeai.Automation) => void;
  deleteAutomation: (automation: Prismeai.Automation) => void;
  createPage: (page: Prismeai.Page) => Promise<Prismeai.Page | null>;
  refreshPage: (page: Prismeai.Page) => void;
  deletePage: (page: Prismeai.Page) => void;
  installApp: (
    app: Prismeai.AppInstance
  ) => Promise<Prismeai.AppInstance | null>;
}

interface WorkspaceProviderProps {
  id: string;
  onUpdate?: (workspace: Workspace) => void;
  children: ReactNode;
}

export const workspaceContext = createContext<WorkspaceContext | undefined>(
  undefined
);

export const useWorkspace = () =>
  useContext<WorkspaceContext>(workspaceContext);

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
  const refreshAutomation: WorkspaceContext['refreshAutomation'] = useCallback(
    (automation) => {
      console.log('refresh', automation);
    },
    []
  );
  const deleteAutomation: WorkspaceContext['deleteAutomation'] = useCallback(
    (automation) => {
      console.log('delete', automation);
    },
    []
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
  const refreshPage: WorkspaceContext['refreshPage'] = useCallback(
    (page) => {
      if (!workspace?.pages || !page.slug || !workspace?.pages[page.slug])
        return;
      setWorkspace({
        ...workspace,
        pages: Object.entries(workspace.pages).reduce(
          (prev, [slug, p]) => ({
            ...prev,
            [slug]: slug === page.slug ? page : p,
          }),
          {}
        ),
      });
    },
    [workspace]
  );
  const deletePage: WorkspaceContext['deletePage'] = useCallback((page) => {
    if (!workspace?.pages || !page.slug || !workspace?.pages[page.slug]) return;
    setWorkspace({
      ...workspace,
      pages: Object.entries(workspace.pages).reduce(
        (prev, [slug, p]) =>
          slug === page.slug
            ? prev
            : {
                ...prev,
                [slug]: p,
              },
        {}
      ),
    });
  }, []);

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
        refreshAutomation,
        deleteAutomation,
        createPage,
        refreshPage,
        deletePage,
        installApp,
      }}
    >
      {children}
    </workspaceContext.Provider>
  );
};

export default WorkspaceProvider;
