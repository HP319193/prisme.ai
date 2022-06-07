import {
  Button,
  Collapse,
  ListItem,
  Modal,
  Schema,
  SchemaForm,
  Tooltip,
} from '@prisme.ai/design-system';
import { ReactElement, useCallback, useMemo } from 'react';
import { BlockLoader } from '@prisme.ai/blocks';
import api from '../utils/api';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useTranslation } from 'next-i18next';
import useBlockAppConfig from '../components/Blocks/useBlockAppConfig';

interface AppsSidebarItemProps extends Prismeai.DetailedAppInstance {
  workspaceId: string;
  onToggle: (app: string, state: boolean) => void;
}

const EmptyObject = {};

const AppsSidebarItem = ({
  workspaceId,
  slug = '',
  config: { schema, block } = EmptyObject,
  onToggle,
}: AppsSidebarItemProps) => {
  const { uninstallApp } = useWorkspaces();
  const { appConfig, onAppConfigUpdate } = useBlockAppConfig({
    workspaceId,
    appInstance: slug,
  });
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
      const s: Schema = {
        type: 'object',
        properties: schema as Schema['properties'],
      };
      return (
        <SchemaForm
          schema={s}
          onSubmit={onAppConfigUpdate}
          initialValues={appConfig}
        />
      );
    }
    if (block) {
      return (
        <BlockLoader
          url={block}
          token={`${api.token}`}
          workspaceId={workspaceId}
          appInstance={slug}
          config={{}}
          appConfig={appConfig}
          onAppConfigUpdate={onAppConfigUpdate}
        />
      );
    }
    return null;
  }, [schema, block, onAppConfigUpdate, appConfig, slug, workspaceId]);

  if (!configComponent)
    return (
      <ListItem
        title={slug}
        rightContent={
          <>
            <Button onClick={onDelete} className="!h-full !p-0 !pr-4">
              <Tooltip title={t('apps.uninstallTooltip')}>
                <DeleteOutlined className="!text-gray hover:!text-accent" />
              </Tooltip>
            </Button>
          </>
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

export default AppsSidebarItem;
