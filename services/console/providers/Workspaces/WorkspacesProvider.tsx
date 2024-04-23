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
  createWorkspace: (
    values: Pick<Prismeai.Workspace, 'name' | 'description' | 'photo'>
  ) => Promise<Workspace>;
  creating: boolean;
  duplicateWorkspace: (
    id: string,
    version?: string
  ) => Promise<Workspace | null>;
  duplicating: Set<string>;
  importArchive: (
    archive: File,
    workspaceId?: string
  ) => Promise<Prismeai.DSULReadOnly | undefined>;
  importing: boolean;
  refreshWorkspace: (workspace: Prismeai.DSUL, deleted?: true) => void;
  deleteWorkspace: (workspaceId: string) => void;
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
    async ({ photo, ...newWorkspace }) => {
      setCreating(true);
      const created = await api.createWorkspace(newWorkspace);
      if (photo) {
        const [{ url }] = await api
          .workspaces(created.id)
          .uploadFiles(photo, { public: true });
        if (url) {
          await api.workspaces(created.id).update({
            photo: url,
          });
          created.photo = url;
        }
      }
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
  const importArchive = useCallback(async (file: File, target) => {
    setImporting(true);
    try {
      const { workspace } = await (target
        ? api.workspaces(target).importArchive(file)
        : api.importArchive(file));
      setImporting(false);
      return workspace;
    } catch (e) {
      console.error(e);
    }
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

  const deleteWorkspace = useCallback((workspaceId: string) => {
    setWorkspaces((prev) => prev.filter(({ id }) => id !== workspaceId));
    api.workspaces(workspaceId).delete();
  }, []);

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
        deleteWorkspace,
      }}
    >
      {children}
    </workspacesContext.Provider>
  );
};

export default WorkspacesProvider;
