import { useWorkspace } from '../../layouts/WorkspaceLayout';
import ShareWorkspacePopover from './ShareWorkspacePopover';

export const ShareWorkspace = () => {
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  return (
    <ShareWorkspacePopover subjectType="workspaces" subjectId={workspaceId} />
  );
};

export default ShareWorkspace;
