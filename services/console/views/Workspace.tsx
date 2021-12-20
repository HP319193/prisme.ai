import { useTranslation } from "react-i18next";
import { EventsViewer } from "../components/EventsViewer";
import getLayout, { useWorkspace } from "../layouts/WorkspaceLayout";

export const Workspace = () => {
  const { t } = useTranslation("workspaces");
  const { workspace } = useWorkspace();

  return (
    <>
      <EventsViewer />
    </>
  );
};

Workspace.getLayout = getLayout;

export default Workspace;
