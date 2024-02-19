import { Popover } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import ShareWorkspace from '../../components/Share/ShareWorkspace';
import { useWorkspace } from '../../providers/Workspace';

interface EditShareProps {
  children: ReactNode;
  className?: string;
}

export const EditShare = ({ children, className }: EditShareProps) => {
  const { workspace } = useWorkspace();
  const { t } = useTranslation('workspaces');
  return (
    <Popover
      content={() => <ShareWorkspace workspaceId={workspace.id} />}
      title={t('share.label')}
      onOpenChange={(open) => {
        // trackEvent({
        //   name: `${open ? 'Open' : 'Close'} Share Panel`,
        //   action: 'click',
        // });
      }}
      placement="bottomRight"
      overlayClassName="[&>.ant-popover-content]:-ml-[16px]"
      className={className}
    >
      <>{children}</>
    </Popover>
  );
};

export default EditShare;
