import {
  Button,
  ListItem,
  Modal,
  Schema,
  SchemaForm,
  Tooltip,
} from '@prisme.ai/design-system';
import { useCallback, useEffect, useState } from 'react';
import { BlockLoader } from '@prisme.ai/blocks';
import api from '../utils/api';
import { DeleteOutlined } from '@ant-design/icons';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import useAppConfig from '../utils/useAppConfig';
import getLayout from '../layouts/WorkspaceLayout';
import { useWorkspace } from '../components/WorkspaceProvider';
import { useApps } from '../components/AppsProvider';

interface AppsProps extends Prismeai.DetailedAppInstance {
  workspaceId: string;
  onToggle: (app: string, state: boolean) => void;
}

const Apps = ({}: AppsProps) => {
  const { workspace } = useWorkspace();
  const { appInstances } = useApps();
  const [currentApp, setCurrentApp] = useState<Prismeai.DetailedAppInstance>();

  const {
    query: { appId },
  } = useRouter();

  // const appId = slug as string;

  useEffect(() => {
    if (!appInstances) return;
    const workspaceApps = appInstances.get(workspace.id);
    if (!workspaceApps) return;

    setCurrentApp(
      workspaceApps.find((appInstance) => appInstance.appSlug === appId)
    );
  }, [appId, appInstances, workspace.id]);

  const { photo, config: { schema, block } = {} } = (currentApp || {
    config: {},
  }) as Prismeai.DetailedAppInstance;

  const { uninstallApp } = useWorkspaces();
  const { appConfig, onAppConfigUpdate } = useAppConfig({
    workspaceId: workspace.id,
    appInstance: `${appId}`, //todo properly type
  });
  const { t } = useTranslation('workspaces');

  const onDelete = useCallback(
    (event) => {
      if (typeof appId !== 'string') return;

      event.stopPropagation();
      Modal.confirm({
        icon: <DeleteOutlined />,
        content: t('apps.uninstall', { appName: appId }),
        onOk: () => uninstallApp(workspace.id, appId),
        okText: t('apps.uninstallConfirm', { appName: appId }),
      });
    },
    [appId, t, uninstallApp, workspace.id]
  );

  console.log('schema', schema);
  console.log('block', block);
  console.log('currentApp', currentApp);

  if (typeof appId !== 'string') return null;

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
        api={api}
        url={block}
        token={`${api.token}`}
        workspaceId={workspace.id}
        appInstance={appId}
        config={{}}
        appConfig={appConfig}
        onAppConfigUpdate={onAppConfigUpdate}
      />
    );
  }

  return (
    <ListItem
      title={
        <div className="flex flex-row items-center">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} className="w-10 h-10 mr-2" alt={appId} />
          )}
          {appId}
        </div>
      }
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
};

Apps.getLayout = getLayout;
export default Apps;
