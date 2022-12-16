import {
  CopyOutlined,
  EllipsisOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

interface WorkspaceMenuProps {
  className?: string;
  onDuplicate?: () => void;
  duplicating?: boolean;
}

export const WorkspaceMenu = ({
  className,
  onDuplicate,
  duplicating = false,
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
                if (duplicating) return;
                onDuplicate();
              }}
              className="focus:outline-none"
            >
              {duplicating ? <LoadingOutlined /> : <CopyOutlined />}
              <span className="ml-3">{t('workspace.duplicate.label')}</span>
            </button>
          ),
        },
      ].filter(Boolean) as ItemType[],
    [t, onDuplicate, duplicating]
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
