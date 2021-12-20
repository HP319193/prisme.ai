import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { FC, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWorkspaces } from "../components/WorkspacesProvider";
import { useWorkspace } from "../layouts/WorkspaceLayout";

interface AutomationsSidebarProps {
  onClose: () => void;
}
export const AutomationsSidebar: FC<AutomationsSidebarProps> = ({
  onClose,
}) => {
  const { t } = useTranslation("workspaces");
  const { push } = useRouter();
  const { update } = useWorkspaces();
  const {
    workspace,
    workspace: { id, automations = {} },
  } = useWorkspace();
  const automationsList = useMemo(
    () => Object.keys(automations),
    [automations]
  );
  const [creating, setCreating] = useState(false);

  const generateAutomationName = useCallback(() => {
    const defaultName = t("automations.create.defaultName");
    let version = 0;
    const generateName = () =>
      `${defaultName}${version ? ` (${version})` : ""}`;
    while (automationsList.includes(generateName())) {
      version++;
    }
    return generateName();
  }, [automationsList, t]);
  const create = useCallback(async () => {
    setCreating(true);
    const name = generateAutomationName();
    await update({
      ...workspace,
      automations: {
        ...automations,
        [name]: {
          triggers: {},
          workflows: {},
        },
      },
    });
    setCreating(false);
    push(`/workspaces/${id}/automations/${name}/manifest`);
    onClose();
  }, [
    automations,
    generateAutomationName,
    id,
    onClose,
    push,
    update,
    workspace,
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
      {automationsList.map((automation) => (
        <div key={automation} onClick={onClose}>
          <Link href={`/workspaces/${id}/automations/${automation}/manifest`}>
            {automation}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AutomationsSidebar;
