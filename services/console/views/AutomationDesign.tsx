import { ReactElement } from "react";
import getAutomationLayout from "../layouts/AutomationLayout";
import getLayout from "../layouts/WorkspaceLayout";

export const AutomationDesign = () => {
  return <>Un design</>;
};

AutomationDesign.getLayout = (page: ReactElement) =>
  getLayout(getAutomationLayout(page));

export default AutomationDesign;
