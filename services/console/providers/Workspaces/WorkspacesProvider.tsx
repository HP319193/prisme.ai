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
  loading: boolean;
  fetchWorkspaces: () => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  creating: boolean;
  duplicateWorkspace: (
    id: string,
    version?: string
  ) => Promise<Workspace | null>;
  duplicating: Set<string>;
  importArchive: (archive: File) => Promise<Prismeai.DSULReadOnly | undefined>;
  importing: boolean;
  refreshWorkspace: (workspace: Prismeai.DSUL, deleted?: true) => void;
}

interface WorkspacesProviderProps {
  children: ReactNode;
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
  const [loading, setLoading] = useState<WorkspacesContext['loading']>(true);
  const [creating, setCreating] =
    useState<WorkspacesContext['creating']>(false);
  const [duplicating, setDuplicating] = useState<
    WorkspacesContext['duplicating']
  >(new Set());

  const fetching = useRef(false);
  const fetchWorkspaces: WorkspacesContext['fetchWorkspaces'] =
    useCallback(async () => {
      if (fetching.current) return;
      fetching.current = true;
      const workspaces = await api.getWorkspaces();
      setWorkspaces(
        workspaces
          .filter(
            (cur) =>
              !(cur.labels || []).includes('suggestions') ||
              cur.createdBy === user?.id
          )
          .map(({ createdAt, updatedAt, ...workspace }) => ({
            ...workspace,
            createdAt: new Date(createdAt),
            updatedAt: new Date(updatedAt),
          }))
      );
      fetching.current = false;
    }, [user?.id]);

  const createWorkspace: WorkspacesContext['createWorkspace'] = useCallback(
    async (name: string) => {
      setCreating(true);
      const created = await api.createWorkspace(name);
      setCreating(false);
      setWorkspaces((prev) => [
        ...prev,
        {
          ...created,
          createdAt: new Date(created.createdAt),
          updatedAt: new Date(created.updatedAt),
        },
      ]);
      return created;
    },
    []
  );

  const duplicateWorkspace: WorkspacesContext['duplicateWorkspace'] =
    useCallback(async (id, version = 'current') => {
      setDuplicating((prev) => new Set([...Array.from(prev), id]));
      const newWorkspace = await api.duplicateWorkspace({ id });
      if (newWorkspace) {
        setWorkspaces((prev) =>
          prev.map((prevW) =>
            prevW.id === newWorkspace.id ? newWorkspace : prevW
          )
        );
      }
      setDuplicating(
        (prev) => new Set(Array.from(prev).filter((i) => id !== i))
      );
      return newWorkspace;
    }, []);

  const [importing, setImporting] = useState(false);
  const importArchive = useCallback(async (file: File) => {
    setImporting(true);
    const { workspace } = await api.importArchive(file);
    setImporting(false);
    return workspace;
  }, []);

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
      setLoading(true);
      await fetchWorkspaces();
      setLoading(false);
    };

    initialFetch();
  }, [fetchWorkspaces, user?.id]);

  return (
    <workspacesContext.Provider
      value={{
        workspaces,
        loading,
        fetchWorkspaces,
        createWorkspace,
        creating,
        duplicateWorkspace,
        duplicating,
        importArchive,
        importing,
        refreshWorkspace,
      }}
    >
      {children}
    </workspacesContext.Provider>
  );
};

export default WorkspacesProvider;
