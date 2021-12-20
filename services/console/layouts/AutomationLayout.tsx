import { FC, ReactElement, useCallback, useMemo } from "react";
import { TabMenu } from "primereact/tabmenu";
import { useWorkspace } from "./WorkspaceLayout";
import { useRouter } from "next/router";
import EditableTitle from "../components/EditableTitle";
import { useWorkspaces } from "../components/WorkspacesProvider";

export const AutomationLayout: FC = ({ children }) => {
  const { workspace } = useWorkspace();
  const { update } = useWorkspaces();
  const {
    query: { id, name },
    route,
    push,
    replace,
  } = useRouter();
  const currentTab = route.split(/\//).pop();
  const updateTitle = useCallback(
    async (newTitle: string) => {
      if (newTitle === name) return;
      if (Object.keys(workspace.automations).includes(newTitle)) return;
      const newAutomations = { ...workspace.automations };
      newAutomations[newTitle] = { ...newAutomations[`${name}`] };
      delete newAutomations[`${name}`];
      await update({
        ...workspace,
        automations: newAutomations,
      });
      replace(`/workspaces/${id}/automations/${newTitle}/${currentTab}`);
    },
    [currentTab, id, name, replace, update, workspace]
  );
  const title = useMemo(
    () => [
      {
        label: "back",
        className: "",
        command: () => push(`/workspaces/${workspace.id}`),
      },
      {
        className: "flex justify-content-center align-items-center ml-2",
        template: () => (
          <EditableTitle title={`${name}`} onChange={updateTitle} />
        ),
      },
    ],
    [name, push, updateTitle, workspace.id]
  );
  const tabs = useMemo(
    () => [
      {
        label: "Design",
        command: () =>
          push(`/workspaces/${workspace.id}/automations/${name}/design`),
      },
      {
        label: "Manifest",
        command: () =>
          push(`/workspaces/${workspace.id}/automations/${name}/manifest`),
      },
    ],
    [name, push, workspace.id]
  );

  return (
    <div className="flex flex-column ">
      <div className="flex flex-1 flex-row">
        <TabMenu model={title} activeIndex={-1} className="flex-1" />
        <TabMenu model={tabs} activeIndex={currentTab === "design" ? 0 : 1} />
      </div>
      <div className="flex">{children}</div>
    </div>
  );
};

export const getLayout = (page: ReactElement) => (
  <AutomationLayout>{page}</AutomationLayout>
);

export default AutomationLayout;
