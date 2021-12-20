import Link from "next/link";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { getLayout as getAutomationLayout } from "../layouts/AutomationLayout";
import getLayout, { useWorkspace } from "../layouts/WorkspaceLayout";

export const AutomationDesign = () => {
  const { t } = useTranslation("workspaces");
  const { workspace } = useWorkspace();

  return <>Un design</>;
};

AutomationDesign.getLayout = (page: ReactElement) =>
  getLayout(getAutomationLayout(page));

export default AutomationDesign;
