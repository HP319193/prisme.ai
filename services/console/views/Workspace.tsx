import { EventsViewer } from '../components/EventsViewer';
import getLayout from '../layouts/WorkspaceLayout';

export const Workspace = () => {
  return <EventsViewer />;
};

Workspace.getLayout = getLayout;

export default Workspace;
