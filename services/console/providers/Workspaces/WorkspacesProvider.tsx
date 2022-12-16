import {
  createContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useUser } from '../../components/UserProvider';
import api, { Workspace } from '../../utils/api';
import { useContext } from '../../utils/useContext';

export interface WorkspacesContext {
  workspaces: Workspace[];
  loading: Map<string, boolean>;
  fetchWorkspaces: () => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  duplicateWorkspace: (
    id: string,
    version?: string
  ) => Promise<Workspace | null>;
  refreshWorkspace: (workspace: Prismeai.DSUL, deleted?: true) => void;
}

interface WorkspacesProviderProps {
  children: ReactNode;
}

export enum LoadingType {
  List = '__LIST__',
  New = '__NEW__',
}

export const workspacesContext = createContext<WorkspacesContext | undefined>(
  undefined
);

export const useWorkspaces = () =>
  useContext<WorkspacesContext>(workspacesContext);

export const WorkspacesProvider = ({ children }: WorkspacesProviderProps) => {
  const { user } = useUser();
  const [workspaces, setWorkspaces] = useState<WorkspacesContext['workspaces']>(
    []
  );
  const [loading, setLoading] = useState<WorkspacesContext['loading']>(
    new Map([[LoadingType.List, true]])
  );

  const setLoadingId = useCallback((id: string, state: boolean) => {
    setLoading((loading) => {
      const newLoading = new Map(loading);
      newLoading.set(id, state);
      return newLoading;
    });
  }, []);

  const fetchWorkspaces: WorkspacesContext['fetchWorkspaces'] = useCallback(async () => {
    const workspaces = await api.getWorkspaces();
    setWorkspaces(
      workspaces.map(({ createdAt, updatedAt, ...workspace }) => ({
        ...workspace,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      }))
    );
  }, []);

  const createWorkspace: WorkspacesContext['createWorkspace'] = useCallback(
    async (name: string) => {
      setLoadingId(LoadingType.New, true);
      const workspace = await api.createWorkspace(name);
      setLoadingId(LoadingType.New, false);
      fetchWorkspaces();
      return workspace;
    },
    [fetchWorkspaces, setLoadingId]
  );

  const duplicateWorkspace: WorkspacesContext['duplicateWorkspace'] = useCallback(
    async (id, version = 'current') => {
      setLoadingId(id, true);
      const newWorkspace = await api.duplicateWorkspace({ id });
      if (newWorkspace) {
        fetchWorkspaces();
      }
      setLoadingId(id, false);
      return newWorkspace;
    },
    [fetchWorkspaces, setLoadingId]
  );

  const refreshWorkspace: WorkspacesContext['refreshWorkspace'] = useCallback(
    (workspace, deleted) => {
      setWorkspaces((workspaces) => {
        return workspaces.flatMap((w) =>
          w.id === workspace.id
            ? deleted
              ? []
              : [{ ...w, ...workspace, updatedAt: new Date() }]
            : [w]
        );
      });
    },
    []
  );

  const prevUserId = useRef<string>();
  useEffect(() => {
    if (!user?.id || prevUserId.current === user.id) return;

    prevUserId.current = user.id;

    const initialFetch = async () => {
      setLoadingId(LoadingType.List, true);
      await fetchWorkspaces();
      setLoadingId(LoadingType.List, false);
    };

    initialFetch();
  }, [fetchWorkspaces, setLoadingId, user?.id]);

  return (
    <workspacesContext.Provider
      value={{
        workspaces,
        loading,
        fetchWorkspaces,
        createWorkspace,
        duplicateWorkspace,
        refreshWorkspace,
      }}
    >
      {children}
    </workspacesContext.Provider>
  );
};

export default WorkspacesProvider;
