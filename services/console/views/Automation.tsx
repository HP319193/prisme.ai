import { useRouter } from "next/router";
import getLayout, { useWorkspace } from "../layouts/WorkspaceLayout";
import Error404 from "./Errors/404";

export const Automation = () => {
  const { workspace } = useWorkspace();
  const {
    query: { automationId },
  } = useRouter();
  const automation = (workspace.automations || {})[`${automationId}`];

  if (!automation) {
    return <Error404 link={`/workspaces/${workspace.id}`} />;
  }
  return (
    <div>
      Automation
      <div>
        <pre>{JSON.stringify(automation, null, "  ")}</pre>
      </div>
    </div>
  );
};

Automation.getLayout = getLayout;

export default Automation;
