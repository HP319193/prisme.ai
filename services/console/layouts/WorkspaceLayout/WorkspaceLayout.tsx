import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import { useWorkspaces } from '../../components/WorkspacesProvider';
import workspaceContext, { Pagination, WorkspaceContext } from './context';
import { EventsByDay } from '.';
import api from '../../utils/api';
import { Event, Events, EventsFilters } from '@prisme.ai/sdk';
import Error404 from '../../views/Errors/404';
import { Layout, Loading, notification } from '@prisme.ai/design-system';
import { useUser } from '../../components/UserProvider';
import HeaderWorkspace from '../../components/HeaderWorkspace';
import Storage from '../../utils/Storage';
import WorkspaceSource from '../../views/WorkspaceSource';
import usePages from '../../components/PagesProvider/context';
import { useApps } from '../../components/AppsProvider';
import debounce from 'lodash/debounce';
import { usePrevious } from '../../utils/usePrevious';
import useLocalizedTextConsole from '../../utils/useLocalizedTextConsole';
import { Workspace } from '../../utils/api';

const PAGINATION_LIMIT = 15;

const getDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addEventToMap = (allEvents: EventsByDay, newEvent: Event<Date>) => {
  const { createdAt } = newEvent;
  const date = getDate(createdAt);
  const prevEvents = allEvents.get(+date) || new Set();
  if (Array.from(prevEvents).find(({ id }) => newEvent.id === id))
    return allEvents;
  const newEvents = [...Array.from(prevEvents), newEvent];
  newEvents.sort((a, b) => +b.createdAt - +a.createdAt);
  allEvents.set(+date, new Set(newEvents));
  return allEvents;
};

const getLatest = (events: Event<Date>[]) => {
  if (events.length === 0) return;
  events.sort((a, b) => +a.createdAt - +b.createdAt);
  return events[0].createdAt;
};

export const WorkspaceLayout: FC = ({ children }) => {
  const { user } = useUser();
  const {
    query: { id },
  } = useRouter();
  const { setPages } = usePages();

  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedTextConsole();
  const { fetch, update, workspaces } = useWorkspaces();
  const [loading, setLoading] = useState<WorkspaceContext['loading']>(false);
  const lockEvents = useRef(false);
  const [workspace, setCurrentWorkspace] = useState<
    WorkspaceContext['workspace'] | null
  >();
  const [events, setEvents] = useState<WorkspaceContext['events']>('loading');
  const [socket, setSocket] = useState<Events>();
  const latest = useRef<Date | undefined | null>();
  const [readEvents, setReadEvents] = useState<WorkspaceContext['readEvents']>(
    new Set()
  );
  const [filters, setFilters] = useState<WorkspaceContext['filters']>({});
  const [pagination, setPagination] = useState<Pagination>({
    page: 0,
    limit: PAGINATION_LIMIT,
  });
  const [mountSourceComponent, setMountComponent] = useState(false);
  const [displaySourceView, setDisplaySourceView] = useState(false);
  const [sourceDisplayed, setSourceDisplayed] = useState(false);
  const [fullSidebar, setFullSidebar] = useState(false);
  const unmount = useRef(false);

  const { fetchPages } = usePages();
  useEffect(() => {
    fetchPages(`${id}`);
  }, [fetchPages, id]);

  const { getAppInstances } = useApps();
  useEffect(() => {
    getAppInstances(`${id}`);
  }, [getAppInstances, id]);

  const displaySource = useCallback((v: boolean) => {
    setSourceDisplayed(v);
  }, []);

  // Manage source panel display
  useEffect(() => {
    if (sourceDisplayed) {
      setMountComponent(true);
    } else {
      setDisplaySourceView(false);
      setTimeout(() => setMountComponent(false), 200);
    }
  }, [sourceDisplayed]);

  // Init socket
  const workspaceId = useMemo(
    () => (workspace ? workspace.id : null),
    [workspace]
  );

  const initSocket = useCallback(async () => {
    if (!workspaceId) return;

    const socketAlreadyInstantiatedForId =
      socket && socket.workspaceId === workspaceId;

    if (socketAlreadyInstantiatedForId) return socket;

    if (socket) {
      socket.destroy();
    }

    const newSocket = await api.streamEvents(workspaceId);

    // listen to workspace update events
    newSocket.all((event, { payload }) => {
      switch (event) {
        case 'workspaces.updated':
          setCurrentWorkspace(() => {
            return payload.workspace;
          });
          return;
        case 'workspaces.apps.installed':
        case 'workspaces.apps.configured':
        case 'workspaces.apps.uninstalled':
          setCurrentWorkspace((workspace) => {
            if (!workspace) return workspace;
            const newImports = Object.keys(workspace.imports || {})
              .filter((key) => key !== payload.slug)
              .reduce(
                (prev, key) => ({
                  ...prev,
                  [key]: (workspace.imports || {})[key],
                }),
                {} as Record<string, Prismeai.AppInstance>
              );

            const newWorkspace = {
              ...workspace,
              imports: newImports,
            };
            if (event !== 'workspaces.apps.uninstalled') {
              newWorkspace.imports[payload.appInstance.appSlug] =
                payload.appInstance.config;
            }

            return newWorkspace;
          });
          return;
        case 'workspaces.automations.created':
        case 'workspaces.automations.updated':
        case 'workspaces.automations.deleted':
          setCurrentWorkspace((workspace) => {
            if (!workspace) return workspace;
            const newAutomations = Object.keys(workspace.automations || {})
              .filter((key) => key !== payload.oldSlug)
              .reduce(
                (prev, key) => ({
                  ...prev,
                  [key]: (workspace.automations || {})[key],
                }),
                {} as Record<string, Prismeai.Automation>
              );
            const newWorkspace = {
              ...workspace,
              automations: newAutomations,
            };

            if (event !== 'workspaces.automations.deleted') {
              newWorkspace.automations[payload.slug] = payload.automation;
            }

            return newWorkspace;
          });
          return;
        case 'workspaces.pages.created':
        case 'workspaces.pages.updated':
        case 'workspaces.pages.deleted':
          if (!workspace) return;
          setPages((pages) => {
            const newPages = new Map(pages);
            const newPagesList = new Set(newPages.get(workspaceId));
            const existingPage = Array.from(newPagesList).find(
              ({ id }) => id === payload.page.id
            );
            if (existingPage) {
              newPagesList.delete(existingPage);
            }
            if (event !== 'workspaces.pages.deleted') {
              newPagesList.add(payload.page);
            }
            newPages.set(workspaceId, newPagesList);
            return newPages;
          });
          return;
      }
    });

    setSocket(newSocket);
  }, [setPages, socket, workspace, workspaceId]);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  const fetchNextEvents = useCallback(
    async (
      emptyEventsList: boolean = false,
      newPagination: Pagination | undefined = undefined,
      newFilters: EventsFilters | undefined = undefined
    ) => {
      if (!workspaceId) return;
      lockEvents.current = true;

      if (newPagination) {
        setPagination(newPagination);
      }
      if (newFilters) {
        setFilters(newFilters);
      }

      const fetched = await api.getEvents(workspaceId, {
        ...(newFilters || filters),
        ...(newPagination || pagination),
      });

      setEvents((events) => {
        const baseEvents =
          events === 'loading' || emptyEventsList ? [] : events;

        const newEvents = new Map(baseEvents);
        fetched.forEach((event) => {
          addEventToMap(newEvents, event);
        });
        latest.current = getLatest(fetched) || null;
        return newEvents;
      });
      lockEvents.current = false;
    },
    [filters, pagination, workspaceId]
  );

  const updateFilters = useCallback(
    async (newFilters: EventsFilters) => {
      fetchNextEvents(true, { page: 0, limit: PAGINATION_LIMIT }, newFilters);
    },
    [fetchNextEvents]
  );

  const nextEvents = useCallback(async () => {
    if (!workspace || lockEvents.current || latest.current === null) return;
    fetchNextEvents(false, { ...pagination, page: pagination.page + 1 });
  }, [fetchNextEvents, pagination, workspace]);

  // Load events history
  const prevWorkspaceId = usePrevious(workspace && workspace.id);
  useEffect(() => {
    if (!workspace || lockEvents.current || workspace.id === prevWorkspaceId) {
      return;
    }
    latest.current = undefined;
    setEvents('loading');
    fetchNextEvents();
  }, [fetchNextEvents, nextEvents, prevWorkspaceId, workspace]);

  useEffect(() => {
    return () => {
      unmount.current = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (
        !socket ||
        (!unmount.current && (!workspace || workspace.id === prevWorkspaceId))
      )
        return;
      socket.destroy();
    };
  }, [prevWorkspaceId, socket, workspace]);

  const readEvent = useCallback(
    (eventId: string) => {
      if (!workspace) return;
      setReadEvents((readEvents) => {
        const newReads = new Set(readEvents);
        newReads.add(eventId);
        Storage.set(`readEvents-${workspace.id}`, Array.from(newReads));
        return newReads;
      });
    },
    [workspace]
  );

  const debouncedFetchWorkspace = useMemo(
    () =>
      debounce(() => {
        if (!workspaceId) return;
        fetch(workspaceId);
      }, 2000),
    [fetch, workspaceId]
  );

  // Listen to new events
  useEffect(() => {
    if (!socket) return;

    const listener = async (
      eventName: string,
      eventData: Prismeai.PrismeEvent
    ) => {
      const event = {
        ...eventData,
        createdAt: new Date(eventData.createdAt || ''),
      };

      setEvents((events) =>
        addEventToMap(new Map(events === 'loading' ? [] : events), event)
      );

      if (workspace && eventName.startsWith('workspaces.')) {
        debouncedFetchWorkspace();
      }
    };
    const off = socket.all(listener);

    return () => {
      off();
    };
  }, [socket, workspace, debouncedFetchWorkspace]);

  const [invalid, setInvalid] = useState<WorkspaceContext['invalid']>(false);
  const [newSource, setNewSource] = useState<WorkspaceContext['newSource']>();
  const [saving, setSaving] = useState(false);
  const [share, setShare] = useState<WorkspaceContext['share']>();

  useEffect(() => {
    const fetchWorkspace = async () => {
      setLoading(true);
      const workspace = await api.getWorkspace(`${id}`);
      setCurrentWorkspace(workspace);
      setLoading(false);
    };
    fetchWorkspace();
  }, [id, workspaces]);

  const saveSource = useCallback(async () => {
    if (!newSource) return;
    setSaving(true);
    const newWorkspace = await update(newSource);
    setSaving(false);
    if (!newWorkspace) {
      return;
    }
    setCurrentWorkspace(newWorkspace);
    notification.success({
      message: t('expert.save.confirm'),
      placement: 'bottomRight',
    });
  }, [newSource, t, update]);

  const save = useCallback(
    async (workspace: Workspace) => {
      setSaving(true);
      const newWorkspace = await update(workspace);
      setSaving(false);
      if (!newWorkspace) {
        return;
      }
      setCurrentWorkspace(newWorkspace);
      notification.success({
        message: t('save.confirm'),
        placement: 'bottomRight',
      });
    },
    [t, update]
  );

  const getAppConfig = useCallback(
    async (appInstance: string) => {
      if (!workspace) return;
      return await api.getAppConfig(workspace.id, appInstance);
    },
    [workspace]
  );
  const saveAppConfig = useCallback(
    async (appInstance: string, config: any) => {
      if (!workspace) return;
      await api.updateAppConfig(workspace.id, appInstance, config);
    },
    [workspace]
  );

  const createAutomation: WorkspaceContext['createAutomation'] = useCallback(
    async (automation) => {
      if (!workspace) return null;
      const automationResult = await api.createAutomation(
        workspace,
        automation
      );
      const { slug, ...newAutomation } = automationResult;
      setCurrentWorkspace({
        ...workspace,
        automations: {
          ...workspace.automations,
          [slug]: newAutomation,
        },
      });
      return automationResult;
    },
    [workspace]
  );

  const updateAutomation: WorkspaceContext['updateAutomation'] = useCallback(
    async (slug, automation) => {
      if (!workspace) return null;
      const automationResult = await api.updateAutomation(
        workspace,
        slug,
        automation
      );

      const { slug: newSlug, ...newAutomation } = automationResult;
      const newAutomations = { ...workspace.automations };

      if (newSlug !== slug) {
        delete newAutomations[slug];
      }
      newAutomations[newSlug] = newAutomation;

      setCurrentWorkspace({
        ...workspace,
        automations: newAutomations,
      });

      return automationResult;
    },
    [workspace]
  );

  const deleteAutomation: WorkspaceContext['deleteAutomation'] = useCallback(
    async (slug) => {
      if (!workspace) return null;
      await api.deleteAutomation(workspace, slug);

      const newWorkspace = {
        ...workspace,
      };

      const { [slug]: removed, ...filteredAutomations } =
        workspace.automations || {};
      newWorkspace.automations = filteredAutomations;
      setCurrentWorkspace(newWorkspace);

      return removed;
    },
    [workspace]
  );

  if (!workspace || !user) {
    return (
      <div className="flex flex-1 justify-center align-center">
        <Loading />
      </div>
    );
  }

  if (!loading && workspace === null) {
    return <Error404 link="/workspaces" reason={t('404')} />;
  }

  return (
    <workspaceContext.Provider
      value={{
        displaySource,
        sourceDisplayed,
        invalid,
        setInvalid,
        saving,
        newSource,
        setNewSource,
        fullSidebar,
        setFullSidebar,

        workspace,
        loading,
        filters,
        updateFilters,
        save,
        saveSource,
        events,
        nextEvents,
        readEvents,
        readEvent,
        share,
        setShare,
        getAppConfig,
        saveAppConfig,
        createAutomation,
        updateAutomation,
        deleteAutomation,
        socket: socket,
      }}
    >
      <Head>
        <title>
          {t('workspace.title', { name: localize(workspace.name) })}
        </title>
        <meta
          name="description"
          content={t('workspace.description', {
            name: localize(workspace.name),
          })}
        />
      </Head>
      <div
        className={`
          absolute top-[75px] bottom-0 right-0 left-0
          bg-white
          flex flex-1
          transition-transform
          transition-duration-200
          transition-ease-in
          z-[11]
          ${displaySourceView ? '' : '-translate-y-full'}
        `}
      >
        {mountSourceComponent && (
          <WorkspaceSource onLoad={() => setDisplaySourceView(true)} />
        )}
      </div>
      <Layout Header={<HeaderWorkspace />}>{children}</Layout>
    </workspaceContext.Provider>
  );
};

export default WorkspaceLayout;
