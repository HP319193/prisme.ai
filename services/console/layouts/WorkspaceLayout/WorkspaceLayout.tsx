import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EditableTitle from "../../components/EditableTitle";
import { useWorkspaces } from "../../components/WorkspacesProvider";
import Main from "../Main";
import SidePanel from "../SidePanel";
import Error404 from "../../views/Errors/404";
import workspaceContext, { WorkspaceContext } from "./context";
import Loading from "../../components/Loading";
import { Button } from "primereact/button";
import AutomationsSidebar from "../../views/AutomationsSidebar";
import Head from "next/head";
import { EventsByDay } from ".";
import Events from "../../api/events";
import { Event } from "../../api/types";
import api from "../../api/api";

const getDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addEventToMap = (allEvents: EventsByDay, newEvent: Event<Date>) => {
  const { createdAt } = newEvent;
  const date = getDate(createdAt);
  const prevEvents = allEvents.get(+date) || new Set();
  if (Array.from(prevEvents).find(({ id }) => newEvent.id === id)) return allEvents;
  const newEvents = [...Array.from(prevEvents), newEvent];
  newEvents.sort((a, b) => +b.createdAt - +a.createdAt)
  allEvents.set(+date, new Set(newEvents));
  return allEvents;
};

const getLatest = (events: Event<Date>[]) => {
  if (events.length === 0) return;
  events.sort((a, b) => +a.createdAt - +b.createdAt)
  return events[0].createdAt
}


export const WorkspaceLayout: FC = ({ children }) => {
  const {
    query: { id },
  } = useRouter();
  const { t } = useTranslation("workspaces");
  const { get, fetch, update } = useWorkspaces();
  const [loading, setLoading] = useState<WorkspaceContext["loading"]>(false);
  const lockEvents = useRef(false)
  const [workspace, setCurrentWorkspace] = useState<
    WorkspaceContext["workspace"] | null
  >();
  const [events, setEvents] = useState<WorkspaceContext['events']>('loading');
  const [socket, setSocket] = useState<Events>();
  const latest = useRef<Date | undefined | null>();

  // Init socket
  useEffect(() => {
    if (!workspace) return;
    const c = new Events(workspace.id);
    setSocket(c);
    return () => {
      c.destroy();
    };
  }, [workspace]);

  const nextEvents = useCallback(async () => {
    if (!workspace || lockEvents.current || latest.current === null) return;
    lockEvents.current = true
    const fetched = await api.getEvents(workspace.id, {
      beforeDate: latest.current
    })
    setEvents(events => {
      const newEvents = new Map(events === 'loading' ? [] : events);
      fetched.forEach(event => {
        addEventToMap(newEvents, event)
      })
      latest.current = getLatest(fetched) || null
      return newEvents
    });
    lockEvents.current = false
  }, [lockEvents, workspace]);

  // Load events history
  useEffect(() => {
    if (!workspace) return;
    latest.current = undefined;
    setEvents('loading')
    nextEvents();
  }, [nextEvents, workspace])

  // Listen to new events
  useEffect(() => {
    if (!socket) return;

    const listener = (eventName: string, eventData: Prismeai.PrismeEvent) => {
      const event = {
        ...eventData,
        createdAt: new Date(eventData.createdAt || ""),
      };

      setEvents(addEventToMap(new Map(events === 'loading' ? [] : events), event));
    };
    const off = socket.all(listener);
    return () => {
      off();
    };
  }, [socket, events]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebar, setSidebar] = useState<"automations" | "apps" | "pages">(
    "automations"
  );

  const setCurrent = useCallback(
    async (id: string) => {
      const alreadyLoaded = get(id);
      if (alreadyLoaded !== undefined) {
        setCurrentWorkspace(alreadyLoaded);
        return;
      }

      setLoading(true);
      const workspace = await fetch(id);
      setLoading(false);
      setCurrentWorkspace(workspace);
    },
    [fetch, get]
  );

  useEffect(() => {
    setCurrent(`${id}`);
  }, [id, setCurrent]);

  const updateTitle = useCallback(
    async (value: string) => {
      if (!workspace || value === workspace.name) return;
      await update({ ...workspace, name: value });
    },
    [update, workspace]
  );

  const displayAutomations = useCallback(() => {
    setTimeout(() => {
      if (sidebarOpen && sidebar === "automations") return;
      setSidebar("automations");
      setSidebarOpen(true);
    }, 200);
  }, [sidebar, sidebarOpen]);
  // const displayApps = useCallback(() => {
  //   setTimeout(() => {
  //     if (sidebarOpen && sidebar === "apps") return;
  //     setSidebar("apps");
  //     setSidebarOpen(true);
  //   }, 200);
  // }, [sidebar, sidebarOpen]);
  // const displayPages = useCallback(() => {
  //   setTimeout(() => {
  //     if (sidebarOpen && sidebar === "pages") return;
  //     setSidebar("pages");
  //     setSidebarOpen(true);
  //   }, 200);
  // }, [sidebar, sidebarOpen]);

  if (!loading && workspace === null) {
    return (
      <Main>
        <Error404 link="/workspaces" reason={t("404")} />
      </Main>
    );
  }

  if (!workspace) {
    return (
      <Main>
        <div className="flex flex-1 justify-content-center align-items-center">
          <Loading />
        </div>
      </Main>
    );
  }

  return (
    <workspaceContext.Provider value={{ workspace, loading, events, nextEvents }}>
      <Head>
        <title>{t("workspace.title", { name: workspace.name })}</title>
        <meta
          name="description"
          content={t("workspace.description", { name: workspace.name })}
        />
      </Head>
      <Main
        leftContent={
          workspace && (
            <EditableTitle title={workspace.name} onChange={updateTitle} />
          )
        }
        rightContent={
          workspace && (
            <>
              <Button
                onClick={displayAutomations}
                className={`
                  mx-2
                  ${sidebarOpen && sidebar === "automations"
                    ? "p-button-secondary"
                    : ""
                  }`}
              >
                {t("automations.link")}
              </Button>
              {/*(
                <Button
                  onClick={displayApps}
                  className={`
                  mx-2
                  ${
                    sidebarOpen && sidebar === "apps"
                      ? "p-button-secondary"
                      : ""
                  }`}
                >
                  {t("apps.link")}
                </Button>
              )}
              {(
                <Button
                  onClick={displayPages}
                  className={`
                  mx-2
                  ${
                    sidebarOpen && sidebar === "pages"
                      ? "p-button-secondary"
                      : ""
                  }`}
                >
                  {t("pages.link")}
                </Button>
                )*/}
            </>
          )
        }
      >
        <div className="flex flex-1">
          <div className="flex flex-1 flex-column overflow-auto">{children}</div>

          <SidePanel
            sidebarOpen={sidebarOpen}
            onClose={() => sidebarOpen && setSidebarOpen(false)}
          >
            {sidebar === "automations" && (
              <AutomationsSidebar onClose={() => setSidebarOpen(false)} />
            )}
            {/*sidebar === "apps" && <div>les apps bientôt</div>}
            {sidebar === "pages" && <div>les pages bientôt</div>*/}
          </SidePanel>
        </div>
      </Main>
    </workspaceContext.Provider>
  );
};

export default WorkspaceLayout;
