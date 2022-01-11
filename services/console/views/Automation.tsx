import { useRouter } from "next/router";
import { ReactElement } from "react";
import getAutomationLayout from "../layouts/AutomationLayout";
import getLayout, { useWorkspace } from "../layouts/WorkspaceLayout";

export const Automation = () => {
  const { workspace } = useWorkspace();
  const {
    replace,
    query: { automationId },
  } = useRouter();
  replace(`/workspaces/${workspace.id}/automations/${automationId}/manifest`);

  return null;
};

Automation.getLayout = (page: ReactElement) =>
  getLayout(getAutomationLayout(page));

export default Automation;
