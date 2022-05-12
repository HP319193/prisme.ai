import {
  Button,
  Collapse,
  ListItem,
  Modal,
  Tooltip,
  BlockProvider,
  useBlock,
  SchemaForm,
  Schema,
} from '@prisme.ai/design-system';
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Block from '../components/Block';
import api from '../utils/api';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useTranslation } from 'next-i18next';
import { useWorkspace } from '../layouts/WorkspaceLayout';

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
  const { getAppConfig, saveAppConfig } = useWorkspace();
  const { t } = useTranslation('workspaces');

  const [value, setValue] = useState();
  const fetchConfig = useRef(async (slug: string) => {
    setValue(await getAppConfig(slug));
  });
  useEffect(() => {
    fetchConfig.current(slug);
  }, [slug]);

  const save = useCallback(
    (values: any) => {
      saveAppConfig(slug, values);
    },
    [saveAppConfig, slug]
  );

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
      return <SchemaForm schema={s} onSubmit={save} initialValues={value} />;
    }
    if (block) {
      return (
        <Block
          url={block}
          entityId={slug}
          token={`${api.token}`}
          workspaceId={workspaceId}
          appInstance={slug}
        />
      );
    }
    return null;
  }, [save, schema, slug, value, block, workspaceId]);

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

const AppsSidebarItemWithBlock = (props: AppsSidebarItemProps) => {
  return (
    <BlockProvider config={{}} appConfig={{}}>
      <AppsSidebarItem {...props} />
    </BlockProvider>
  );
};

export default AppsSidebarItemWithBlock;
