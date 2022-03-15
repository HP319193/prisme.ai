import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import { useWorkspaces } from '../../components/WorkspacesProvider';
import workspaceContext, { WorkspaceContext } from './context';
import { EventsByDay } from '.';
import api from '../../utils/api';
import { Event, Events } from '@prisme.ai/sdk';
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

  const { t } = useTranslation('workspaces');
  const { fetch, update, workspaces } = useWorkspaces();
  const [loading, setLoading] = useState<WorkspaceContext['loading']>(false);
  const lockEvents = useRef(false);
  const [workspace, setCurrentWorkspace] = useState<
    WorkspaceContext['workspace'] | null
  >();
  const [events, setEvents] = useState<WorkspaceContext['events']>('loading');
  const socket = useRef<Events>();
  const latest = useRef<Date | undefined | null>();
  const [readEvents, setReadEvents] = useState<WorkspaceContext['readEvents']>(
    new Set()
  );
  const [mountSourceComponent, setMountComponent] = useState(false);
  const [displaySourceView, setDisplaySourceView] = useState(false);
  const [sourceDisplayed, setSourceDisplayed] = useState(false);
  const [fullSidebar, setFullSidebar] = useState(false);
  const prevWorkspaceId = usePrevious((workspace || {}).id);

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
  const workspaceId = useMemo(() => (workspace ? workspace.id : null), [
    workspace,
  ]);
  useEffect(() => {
    if (
      !workspaceId ||
      (socket.current && socket.current.workspaceId === workspaceId)
    )
      return;
    socket.current = api.streamEvents(workspaceId);
    return () => {
      socket.current && socket.current.destroy();
    };
  }, [workspaceId]);

  const nextEvents = useCallback(async () => {
    if (!workspace || lockEvents.current || latest.current === null) return;
    lockEvents.current = true;
    const fetched = await api.getEvents(workspace.id, {
      beforeDate: latest.current,
    });
    setEvents((events) => {
      const newEvents = new Map(events === 'loading' ? [] : events);
      fetched.forEach((event) => {
        addEventToMap(newEvents, event);
      });
      latest.current = getLatest(fetched) || null;
      return newEvents;
    });
    lockEvents.current = false;
  }, [lockEvents, workspace]);

  // Load events history
  useEffect(() => {
    if (!workspace || lockEvents.current || prevWorkspaceId === workspace.id)
      return;
    latest.current = undefined;
    setEvents('loading');
    nextEvents();
  }, [nextEvents, prevWorkspaceId, workspace]);

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
    if (!socket.current) return;

    const listener = async (
      eventName: string,
      eventData: Prismeai.PrismeEvent
    ) => {
      const event = {
        ...eventData,
        createdAt: new Date(eventData.createdAt || ''),
      };

      await setEvents(
        addEventToMap(new Map(events === 'loading' ? [] : events), event)
      );

      if (workspace && eventName.startsWith('workspaces.')) {
        debouncedFetchWorkspace();
      }
    };
    const off = socket.current.all(listener);
    return () => {
      off();
    };
  }, [socket, events, workspace, debouncedFetchWorkspace]);

  const [invalid, setInvalid] = useState<WorkspaceContext['invalid']>(false);
  const [newSource, setNewSource] = useState<WorkspaceContext['newSource']>();
  const [saving, setSaving] = useState(false);
  const [share, setShare] = useState<WorkspaceContext['share']>();

  const setCurrent = useRef(async (id: string) => {
    setLoading(true);
    await fetch(id);
    setLoading(false);
  });

  useEffect(() => {
    setCurrent.current(`${id}`);
  }, [id]);

  useEffect(() => {
    setCurrentWorkspace(workspaces.get(`${id}`));
  }, [id, workspaces]);

  const updateTitle = useCallback(
    async (value: string) => {
      if (!workspace || value === workspace.name) return;
      await update({ ...workspace, name: value });
    },
    [update, workspace]
  );

  const save = useCallback(async () => {
    if (!newSource) return;
    setSaving(true);
    const newWorkspace = await update(newSource);
    setSaving(false);
    if (!newWorkspace) {
      notification.error({
        message: t('expert.save.fail'),
        placement: 'bottomRight',
      });
      return;
    }
    setCurrentWorkspace(newWorkspace);
    notification.success({
      message: t('expert.save.confirm'),
      placement: 'bottomRight',
    });
  }, [newSource, t, update]);

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
        save,
        events,
        nextEvents,
        readEvents,
        readEvent,
        share,
        setShare,
        getAppConfig,
        saveAppConfig,
      }}
    >
      <Head>
        <title>{t('workspace.title', { name: workspace.name })}</title>
        <meta
          name="description"
          content={t('workspace.description', { name: workspace.name })}
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
          z-10
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
