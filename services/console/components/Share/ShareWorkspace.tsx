import { useWorkspace } from '../../layouts/WorkspaceLayout';
import SharePopover from './SharePopover';

export const ShareWorkspace = () => {
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  return <SharePopover subjectType="workspaces" subjectId={workspaceId} />;
};

export default ShareWorkspace;
