import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useState } from "react";
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

export const WorkspaceLayout: FC = ({ children }) => {
  const {
    query: { id },
  } = useRouter();
  const { t } = useTranslation("workspaces");
  const { get, fetch, update } = useWorkspaces();
  const [loading, setLoading] = useState<WorkspaceContext["loading"]>(false);
  const [workspace, setCurrentWorkspace] = useState<
    WorkspaceContext["workspace"] | null
  >();
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
    <workspaceContext.Provider value={{ workspace, loading }}>
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
                  ${
                    sidebarOpen && sidebar === "automations"
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
          <div className="flex flex-1 flex-column">{children}</div>

          <SidePanel
            sidebarOpen={sidebarOpen}
            onClose={() => sidebarOpen && setSidebarOpen(false)}
          >
            {sidebar === "automations" && (
              <AutomationsSidebar onClose={() => setSidebarOpen(false)} />
            )}
            {sidebar === "apps" && <div>les apps bientôt</div>}
            {sidebar === "pages" && <div>les pages bientôt</div>}
          </SidePanel>
        </div>
      </Main>
    </workspaceContext.Provider>
  );
};

export default WorkspaceLayout;
