import { useWorkspace } from '../../providers/Workspace';
import ShareWorkspacePopover from './ShareWorkspacePopover';

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
