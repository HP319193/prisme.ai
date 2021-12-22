import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import { useWorkspace } from "../WorkspaceLayout";
import { useRouter } from "next/router";
import EditableTitle from "../../components/EditableTitle";
import { useWorkspaces } from "../../components/WorkspacesProvider";
import { useTranslation } from "next-i18next";
import { Button } from "primereact/button";
import context, { AutomationLayoutContext } from "./context";
import { validateAutomation } from "@prisme.ai/validation";
import { ValidationError } from "../../utils/yaml";

export const AutomationLayout: FC = ({ children }) => {
  const { t } = useTranslation("workspaces");
  const {
    query: { id, name },
    route,
    push,
    replace,
  } = useRouter();
  const { workspace } = useWorkspace();
  const [automation, setCurrentAutomation] = useState({
    name: `${name}`,
    value: workspace.automations[`${name}`],
  });
  const { update } = useWorkspaces();
  const [invalid, setInvalid] = useState<false | ValidationError[]>(false);

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

  const setAutomation: AutomationLayoutContext["setAutomation"] = useCallback(
    (automation) => {
      validateAutomation(automation);
      validateAutomation.errors;
      setInvalid((validateAutomation.errors as ValidationError[]) || false);
      setCurrentAutomation({
        name: `${name}`,
        value: automation,
      });
    },
    [name]
  );
  const reset: AutomationLayoutContext["reset"] = useCallback(() => {
    setCurrentAutomation({
      name: `${name}`,
      value: workspace.automations[`${name}`],
    });
  }, [name, workspace.automations]);
  const save: AutomationLayoutContext["save"] = useCallback(() => {
    if (invalid) return;
    update({
      ...workspace,
      automations: {
        ...workspace.automations,
        [automation.name]: automation.value,
      },
    });
  }, [automation.name, automation.value, update, invalid, workspace]);

  const title = useMemo(
    () => [
      {
        label: t("automations.back"),
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
    [name, push, t, updateTitle, workspace.id]
  );
  const tabs = useMemo(
    () => [
      {
        label: t("automations.design.title"),
        command: () =>
          push(`/workspaces/${workspace.id}/automations/${name}/design`),
      },
      {
        label: t("automations.manifest.title"),
        command: () =>
          push(`/workspaces/${workspace.id}/automations/${name}/manifest`),
      },
      {
        className: "flex justify-content-center align-items-center ml-2 mr-2",
        template: () => (
          <div>
            <Button onClick={save} disabled={!!invalid}>
              {t("automations.save.label")}
            </Button>
          </div>
        ),
      },
    ],
    [invalid, name, push, save, t, workspace.id]
  );

  return (
    <context.Provider
      value={{ automation, setAutomation, reset, save, invalid }}
    >
      <div className="flex flex-column flex-1">
        <div className="flex flex-row">
          <TabMenu model={title} activeIndex={-1} className="flex-1" />
          <TabMenu model={tabs} activeIndex={currentTab === "design" ? 0 : 1} />
        </div>
        <div className="flex flex-1 flex-column">{children}</div>
      </div>
    </context.Provider>
  );
};

export default AutomationLayout;
