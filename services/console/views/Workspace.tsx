import { Activities } from '../components/Activities';
import getLayout from '../layouts/WorkspaceLayout';
import { EventsProvider } from '../providers/Events';
import { useWorkspace } from '../providers/Workspace';

export const Workspace = () => {
  const {
    workspace: { id },
  } = useWorkspace();
  return (
    <EventsProvider workspaceId={id}>
      <Activities />
    </EventsProvider>
  );
};

Workspace.getLayout = getLayout;

export default Workspace;
