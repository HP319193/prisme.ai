import Form from '../components/SchemaForm/Form';
import {
  Button,
  Collapse,
  ListItem,
  Modal,
  Tooltip,
} from '@prisme.ai/design-system';
import { memo, ReactElement, useCallback, useMemo } from 'react';
import Block from '../components/Block';
import api from '../utils/api';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useTranslation } from 'next-i18next';

interface AppsSidebarItemProps extends Prismeai.AppInstance {
  workspaceId: string;
  onToggle: (app: string, state: boolean) => void;
}

const AppsSidebarItem = ({
  workspaceId,
  slug = '',
  config: { schema, value, widget } = {},
  onToggle,
}: AppsSidebarItemProps) => {
  const { uninstallApp } = useWorkspaces();
  const { t } = useTranslation('workspaces');

  const onDelete = useCallback(
    (event) => {
      event.stopPropagation();
      Modal.confirm({
        icon: <DeleteOutlined />,
        content: t('apps.uninstall', { appName: slug }),
        onOk: () => uninstallApp(workspaceId, slug),
        okText: t('apps.uninstallConfirm', { appName: slug }),
      });
    },
    [slug, t, uninstallApp, workspaceId]
  );

  const configComponent: ReactElement | null = useMemo(() => {
    if (schema) {
      return <Form schema={schema} onSubmit={() => {}} initialValues={value} />;
    }
    if (widget) {
      return (
        <Block
          url={widget}
          entityId={slug}
          token={`${api.token}`}
          workspaceId={workspaceId}
          appInstance={slug}
        />
      );
    }
    return null;
  }, [schema, slug, value, widget, workspaceId]);

  if (!configComponent)
    return (
      <ListItem
        title={slug}
        rightContent={
          <Button onClick={onDelete} className="!h-full !p-0 !pr-4">
            <Tooltip title={t('apps.uninstallTooltip')}>
              <DeleteOutlined className="!text-gray hover:!text-accent" />
            </Tooltip>
          </Button>
        }
        className="!cursor-default"
      />
    );

  return (
    <Collapse
      light
      key={slug}
      items={[
        {
          label: `${slug}`,
          content: configComponent,
        },
      ]}
      icon={({ isActive }) => {
        // Timeout to avoid set state while rendering
        setTimeout(() => onToggle(slug, !!isActive));

        return (
          <div>
            <Button onClick={() => onToggle(slug, !!isActive)}>
              <Tooltip title={t('apps.configTooltip')}>
                <SettingOutlined
                  className={`${isActive ? '!text-accent' : '!text-gray'}`}
                />
              </Tooltip>
            </Button>
            <Button onClick={onDelete}>
              <Tooltip title={t('apps.uninstallTooltip')}>
                <DeleteOutlined className="!text-gray hover:!text-accent" />
              </Tooltip>
            </Button>
          </div>
        );
      }}
    />
  );
};

export default memo(AppsSidebarItem);
