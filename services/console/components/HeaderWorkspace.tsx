import { useCallback, useMemo, useState } from 'react';
import {
  AppstoreAddOutlined,
  CodeOutlined,
  DeleteOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Menu,
  Modal,
  notification,
  Popover,
  Space,
} from '@prisme.ai/design-system';
import { useWorkspaces } from './WorkspacesProvider';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Header from './Header';
import ShareWorkspace from './Share/ShareWorkspace';
import PublishModal from './PublishModal';

const HeaderWorkspace = () => {
  const { t } = useTranslation('workspaces');
  const { remove } = useWorkspaces();
  const {
    workspace: { id, name: currentWorkspace },
    displaySource,
    sourceDisplayed,
    share: { label, component: ShareComponent = ShareWorkspace } = {},
  } = useWorkspace();
  const { push } = useRouter();
  const [publishVisible, setPublishVisible] = useState(false);

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
          message: t('workspace.delete.toast'),
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
                <AppstoreAddOutlined className="mr-2" />
                {t(`apps.publish.menuLabel`)}
              </div>
            ),
            key: 'publish',
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
            case 'publish':
              setPublishVisible(true);
              break;
            case 'delete':
              confirmDelete();
          }
        }}
      />
    ),
    [t, sourceDisplayed, displaySource, setPublishVisible, confirmDelete]
  );

  return (
    <>
      <PublishModal
        visible={publishVisible}
        close={() => setPublishVisible(false)}
      />
      <Header
        title={<Dropdown Menu={workspacesMenu}>{currentWorkspace}</Dropdown>}
        leftContent={
          <Popover
            content={() => <ShareComponent />}
            title={label || t('share.label')}
          >
            <Button variant="grey">
              <Space>
                {t('share.label')}
                <ShareAltOutlined />
              </Space>
            </Button>
          </Popover>
        }
      />
    </>
  );
};

export default HeaderWorkspace;
