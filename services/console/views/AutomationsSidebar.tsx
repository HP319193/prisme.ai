import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { FC, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "../layouts/WorkspaceLayout";
import { useWorkspaces } from "../components/WorkspacesProvider";
import path from "path/posix";
import { useToaster } from "../layouts/Toaster";

interface AutomationsSidebarProps {
  onClose: () => void;
}

export const AutomationsSidebar: FC<AutomationsSidebarProps> = ({
  onClose,
}) => {
  const { t } = useTranslation("workspaces");
  const { push } = useRouter();
  const {
    workspace,
    workspace: { id: workspaceId, automations = [] },
  } = useWorkspace();

  const { createAutomation } = useWorkspaces();

  const [creating, setCreating] = useState(false);

  const generateAutomationName = useCallback(() => {
    const defaultName = t("automations.create.defaultName");
    let version = 0;
    const generateName = () =>
      `${defaultName}${version ? ` (${version})` : ""}`;
    while (automations.find(({ name }) => name === generateName())) {
      version++;
    }
    return generateName();
  }, [automations, t]);

  const create = useCallback(async () => {
    setCreating(true);

    const name = generateAutomationName();
    const createdAutomation = await createAutomation(workspace, {
      name,
      triggers: {
        [t("automations.create.value.trigger")]: {
          events: [t("automations.create.value.event")],
          do: t("automations.create.value.workflow"),
        },
      },
      workflows: {
        [t("automations.create.value.workflow")]: {
          do: [
            {
              emit: {
                event: t("automations.create.value.event"),
              },
            },
          ],
        },
      },
    });
    console.log("createdAutomation", createdAutomation);
    setCreating(false);
    onClose();
    if (createdAutomation) {
      await push(
        `/workspaces/${workspaceId}/automations/${createdAutomation.id}/manifest`
      );
    }
  }, [
    generateAutomationName,
    createAutomation,
    workspace,
    t,
    onClose,
    push,
    workspaceId,
  ]);

  return (
    <div>
      <div>{t("automations.link")}</div>
      <div>
        <Button onClick={create} disabled={creating}>
          <div
            className={`mr-2 pi ${creating ? "pi-spin pi-spinner" : "pi-plus"}`}
          />
          {t("automations.create.label")}
        </Button>
      </div>
      {automations.map((automation) => (
        <div
          key={automation.id}
          onClick={onClose}
          className="flex justify-content-between align-items-center"
        >
          <Link
            href={`/workspaces/${workspaceId}/automations/${automation.id}/manifest`}
          >
            {automation.name}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AutomationsSidebar;
