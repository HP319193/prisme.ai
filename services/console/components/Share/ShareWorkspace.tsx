import ShareWorkspacePopover from './ShareWorkspacePopover';

interface ShareWorkspaceProps {
  workspaceId: string;
}

export const ShareWorkspace = ({ workspaceId }: ShareWorkspaceProps) => {
  return (
    <ShareWorkspacePopover subjectType="workspaces" subjectId={workspaceId} />
  );
};

export default ShareWorkspace;
