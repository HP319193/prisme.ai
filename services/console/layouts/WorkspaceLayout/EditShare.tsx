import { Popover } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import ShareWorkspace from '../../components/Share/ShareWorkspace';
import { useWorkspace } from '../../providers/Workspace';
import { CloseCircleOutlined } from '@ant-design/icons';

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
      titleClassName="flex m-0 pb-0 pt-4 pl-4 pr-4"
      title={({ setOpen }) => (
        <div className="flex flex-1 justify-between">
          {t('share.label')}
          <button
            onClick={() => {
              setOpen(false);
            }}
          >
            <CloseCircleOutlined />
          </button>
        </div>
      )}
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
