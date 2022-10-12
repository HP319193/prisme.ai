import { EllipsisOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

interface WorkspaceMenuProps {
  className?: string;
  onDuplicate: () => void;
}

export const WorkspaceMenu = ({
  className,
  onDuplicate,
}: WorkspaceMenuProps) => {
  const { t } = useTranslation('workspaces');
  const items = useMemo(
    () => [
      {
        key: 'duplicate',
        label: (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            {t('workspace.duplicate.label')}
          </button>
        ),
      },
    ],
    [t, onDuplicate]
  );
  const menu = useMemo(() => <Menu items={items} />, [items]);
  return (
    <Dropdown overlay={menu} className={className} trigger={['click']}>
      <button onClick={(e) => e.preventDefault()} className="rotate-90">
        <EllipsisOutlined className="text-2xl" />
      </button>
    </Dropdown>
  );
};

export default WorkspaceMenu;
