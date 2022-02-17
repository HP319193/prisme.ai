import { Dispatch, useCallback, useMemo, SetStateAction } from 'react';
import { CodeOutlined, ShareAltOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Menu,
  Dropdown,
  Space,
  Button,
  Popover,
} from '@prisme.ai/design-system';
import { Modal, notification } from 'antd';
import { useWorkspaces } from './WorkspacesProvider';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Header from './Header';
import SharePopover from './SharePopover';

const HeaderWorkspace = () => {
  const { t } = useTranslation('workspaces');
  const { remove } = useWorkspaces();
  const {
    workspace: { id, name: currentWorkspace },
    displaySource,
    sourceDisplayed,
  } = useWorkspace();
  const { push } = useRouter();

  const confirmDelete = useCallback(() => {
    Modal.confirm({
      icon: <DeleteOutlined />,
      title: t('workspace.delete.confirm.title', {
        name: currentWorkspace,
      }),
      content: t('workspace.delete.confirm.content'),
      cancelText: t('workspace.delete.confirm.ok'),
      okText: t('workspace.delete.confirm.cancel'),
      onCancel: () => {
        push('/workspaces');
        remove({ id });
        notification.success({
          message: t('automations.delete.toast'),
          placement: 'bottomRight',
        });
      },
    });
  }, [currentWorkspace, id, push, remove, t]);

  const workspacesMenu = useMemo(
    () => (
      <Menu
        items={[
          {
            label: (
              <div className="flex items-center">
                <CodeOutlined className="mr-2" />
                {t(`expert.${sourceDisplayed ? 'hide' : 'show'}`)}
              </div>
            ),
            key: 'source',
          },
          {
            label: (
              <div className="flex items-center">
                <DeleteOutlined className="mr-2" />
                {t(`workspace.delete.label`)}
              </div>
            ),
            key: 'delete',
          },
        ]}
        onClick={(item) => {
          if (typeof item === 'string') return;
          switch (item.key) {
            case 'source':
              displaySource(!sourceDisplayed);
              break;
            case 'delete':
              confirmDelete();
          }
        }}
      />
    ),
    [t, displaySource, sourceDisplayed]
  );

  return (
    <Header
      title={<Dropdown Menu={workspacesMenu}>{currentWorkspace}</Dropdown>}
      leftContent={
        <Popover
          content={({
            setVisible,
          }: {
            setVisible: Dispatch<SetStateAction<boolean>>;
          }) => <SharePopover setVisible={setVisible} />}
          title={t('workspace.share')}
        >
          <Button variant="grey">
            <Space>
              {t('workspace.share')}
              <ShareAltOutlined />
            </Space>
          </Button>
        </Popover>
      }
    />
  );
};

export default HeaderWorkspace;
