import ShareWorkspacePopover from './ShareWorkspacePopover';
import { useWorkspace } from '../WorkspaceProvider';

interface ShareWorkspaceProps {
  parentWorkspaceId?: string;
}

export const ShareWorkspace = ({ parentWorkspaceId }: ShareWorkspaceProps) => {
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  return (
    <ShareWorkspacePopover
      subjectType="workspaces"
      subjectId={parentWorkspaceId || workspaceId}
    />
  );
};

export default ShareWorkspace;
