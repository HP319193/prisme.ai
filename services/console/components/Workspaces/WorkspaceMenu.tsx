import {
  CopyOutlined,
  EllipsisOutlined,
  ImportOutlined,
  LoadingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

interface WorkspaceMenuProps {
  className?: string;
  onDuplicate?: () => void;
  duplicating?: boolean;
  onCreate?: () => void;
  creating?: boolean;
  onImport?: () => void;
  importing?: boolean;
}

export const WorkspaceMenu = ({
  className,
  onDuplicate,
  duplicating = false,
  onCreate,
  creating = false,
  onImport,
  importing = false,
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
        onCreate && {
          key: 'create',
          label: (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (creating) return;
                onCreate();
              }}
              className="focus:outline-none"
            >
              {creating ? <LoadingOutlined /> : <PlusOutlined />}
              <span className="ml-3">{t('workspace.create.label')}</span>
            </button>
          ),
        },
        onImport && {
          key: 'import',
          label: (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (importing) return;
                onImport();
              }}
              className="focus:outline-none"
            >
              {importing ? <LoadingOutlined /> : <ImportOutlined />}
              <span className="ml-3">{t('workspace.import.label')}</span>
            </button>
          ),
        },
      ].filter(Boolean) as ItemType[],
    [onDuplicate, duplicating, t, onCreate, creating, onImport, importing]
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
