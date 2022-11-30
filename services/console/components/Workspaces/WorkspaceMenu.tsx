import { CopyOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

interface WorkspaceMenuProps {
  className?: string;
  onDuplicate?: () => void;
}

export const WorkspaceMenu = ({
  className,
  onDuplicate,
}: WorkspaceMenuProps) => {
  const { t } = useTranslation('workspaces');
  const items = useMemo(
    () =>
      [
        onDuplicate && {
          key: 'duplicate',
          label: (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="focus:outline-none"
            >
              <CopyOutlined />
              <span className="ml-3">{t('workspace.duplicate.label')}</span>
            </button>
          ),
        },
      ].filter(Boolean) as ItemType[],
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
