import { useCallback, useMemo } from 'react';
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
  Popover,
  Space,
} from '@prisme.ai/design-system';
import { Modal, notification } from 'antd';
import { useWorkspaces } from './WorkspacesProvider';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Header from './Header';
import ShareWorkspace from './Share/ShareWorkspace';

const HeaderWorkspace = () => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');
  const { remove, publishApp } = useWorkspaces();
  const {
    workspace,
    workspace: { id, name: currentWorkspace },
    displaySource,
    sourceDisplayed,
    share: { label, component: ShareComponent = ShareWorkspace } = {},
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

  const confirmPublishApp = useCallback(() => {
    Modal.confirm({
      icon: <AppstoreAddOutlined />,
      title: t('apps.publish.confirm.title', {
        name: currentWorkspace,
      }),
      content: t('apps.publish.confirm.content'),
      cancelText: commonT('cancel'),
      okText: t('apps.publish.confirm.ok'),
      onOk: async () => {
        try {
          await publishApp({
            workspaceId: workspace.id,
            name: workspace.name,
            description: workspace.description,
            photo: workspace.photo,
            slug: workspace.name,
          });
          notification.success({
            message: t('apps.publish.confirm.toast'),
            placement: 'bottomRight',
          });
        } catch (e) {
          notification.error({
            message: t('api', { errorName: e }),
            placement: 'bottomRight',
          });
          console.error(e);
          return null;
        }
      },
    });
  }, [
    commonT,
    currentWorkspace,
    publishApp,
    t,
    workspace.description,
    workspace.id,
    workspace.name,
    workspace.photo,
  ]);

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
              confirmPublishApp();
              break;
            case 'delete':
              confirmDelete();
          }
        }}
      />
    ),
    [t, sourceDisplayed, displaySource, confirmDelete]
  );

  return (
    <Header
      title={<Dropdown Menu={workspacesMenu}>{currentWorkspace}</Dropdown>}
      leftContent={
        <Popover
          content={() => <ShareComponent />}
          title={label || t('share.label')}
        >
          <Button variant="grey">
            <Space>
              {label || t('share.label')}
              <ShareAltOutlined />
            </Space>
          </Button>
        </Popover>
      }
    />
  );
};

export default HeaderWorkspace;
