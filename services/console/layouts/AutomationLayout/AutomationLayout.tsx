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
import Error404 from "../../views/Errors/404";
import { useToaster } from "../Toaster";

export const AutomationLayout: FC = ({ children }) => {
  const { t } = useTranslation("workspaces");
  const {
    query: { automationId },
    route,
    push,
  } = useRouter();
  const { workspace } = useWorkspace();
  const { updateAutomation } = useWorkspaces();
  const [automation, setCurrentAutomation] = useState<Prismeai.Automation>();
  const toaster = useToaster();
  const [dirty, setDirty] = useState(false);

  const [invalid, setInvalid] = useState<false | ValidationError[]>(false);

  const currentTab = route.split(/\//).pop();

  const reset: AutomationLayoutContext["reset"] = useCallback(() => {
    setCurrentAutomation(
      workspace.automations.find((automation) => automation.id === automationId)
    );
    setDirty(false);
  }, [automationId, workspace]);
  useEffect(() => {
    reset();
  }, [reset]);

  const updateTitle = useCallback(
    async (newTitle: string) => {
      if (!automation || automation.name === newTitle) return;
      setDirty(true);
      updateAutomation(workspace, {
        ...automation,
        name: newTitle,
      });
    },
    [automation, updateAutomation, workspace]
  );

  const setAutomation: AutomationLayoutContext["setAutomation"] = useCallback(
    (newAutomation) => {
      validateAutomation(newAutomation);
      validateAutomation.errors;
      setInvalid((validateAutomation.errors as ValidationError[]) || false);
      setCurrentAutomation({
        ...automation,
        ...newAutomation,
      });
      setDirty(true);
    },
    [automation]
  );

  const save: AutomationLayoutContext["save"] = useCallback(async () => {
    if (invalid || !automation) return;
    try {
      await updateAutomation(workspace, {
        ...automation,
      });
      toaster.show({
        severity: "success",
        summary: t("automations.save.toast"),
      });
      setDirty(false);
    } catch (e) {
      toaster.show({
        severity: "error",
        summary: t("automations.save.error"),
      });
    }
  }, [invalid, automation, toaster, t, updateAutomation, workspace]);

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
          <EditableTitle
            title={`${automation && automation.name}`}
            onChange={updateTitle}
          />
        ),
      },
    ],
    [automation, push, t, updateTitle, workspace.id]
  );

  const tabs = useMemo(
    () => [
      {
        label: t("automations.design.title"),
        command: () =>
          push(
            `/workspaces/${workspace.id}/automations/${automationId}/design`
          ),
      },
      {
        label: t("automations.manifest.title"),
        command: () =>
          push(
            `/workspaces/${workspace.id}/automations/${automationId}/manifest`
          ),
      },
      {
        className: "flex justify-content-center align-items-center ml-2 mr-2",
        template: () => (
          <div>
            <Button onClick={save} disabled={!dirty || !!invalid}>
              {t("automations.save.label")}
            </Button>
          </div>
        ),
      },
    ],
    [automationId, dirty, invalid, push, save, t, workspace.id]
  );

  if (!automation) {
    return <Error404 link="/automations" reason={t("404")} />;
  }

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
