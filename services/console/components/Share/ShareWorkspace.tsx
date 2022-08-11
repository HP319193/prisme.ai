import ShareWorkspacePopover from './ShareWorkspacePopover';
import { useWorkspace } from '../WorkspaceProvider';

export const ShareWorkspace = () => {
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  return (
    <ShareWorkspacePopover subjectType="workspaces" subjectId={workspaceId} />
  );
};

export default ShareWorkspace;
