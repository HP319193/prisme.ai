import { Loading } from '@prisme.ai/design-system';
import { useRouter } from 'next/router';
import {
  createContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import api, { Events } from '../../utils/api';
import { useContext } from '../../utils/useContext';
import updateOnEvents from './updateOnEvents';

export interface Workspace extends Prismeai.DSULReadOnly {
  id: string;
}

export interface WorkspaceContext {
  workspace: Workspace;
  loading: boolean;
  events: Events;
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
  const { replace } = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceContext['workspace']>();
  const [loading, setLoading] = useState<WorkspaceContext['loading']>(true);
  const [saving, setSaving] = useState<WorkspaceContext['saving']>(false);
  const [events, setEvents] = useState<Events>();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let events: Events;
    const initEvents = async () => {
      events = await api.streamEvents(id);
      setEvents(events);
      updateOnEvents(events, setWorkspace);
    };
    initEvents();

    return () => {
      events?.destroy();
    };
  }, [id]);

  useEffect(() => {
    onUpdate && workspace && onUpdate(workspace);
  }, [workspace, onUpdate]);

  const fetchWorkspace: WorkspaceContext['fetchWorkspace'] = useCallback(async () => {
    setNotFound(false);
    try {
      const workspace = await api.getWorkspace(id);
      if (workspace) {
        setWorkspace({
          id,
          ...workspace,
        } as Workspace);
      }
    } catch {
      setNotFound(true);
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

  useEffect(() => {
    if (!notFound) return;
    replace('/workspaces');
  }, [notFound, replace]);

  if (loading) return <Loading />;
  if (notFound) return null;
  if (!workspace || !events) return null;
  return (
    <workspaceContext.Provider
      value={{
        workspace,
        events,
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
