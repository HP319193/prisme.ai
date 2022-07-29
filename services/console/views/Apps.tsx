import {
  Modal,
  PageHeader,
  Schema,
  SchemaForm,
} from '@prisme.ai/design-system';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import useLocalizedText from '../utils/useLocalizedText';

interface AppsProps extends Prismeai.DetailedAppInstance {
  workspaceId: string;
  onToggle: (app: string, state: boolean) => void;
}

const Apps = ({}: AppsProps) => {
  const { workspace } = useWorkspace();
  const { appInstances } = useApps();
  const { localize } = useLocalizedText();

  const [currentApp, setCurrentApp] = useState<Prismeai.DetailedAppInstance>();

  const {
    query: { appId },
  } = useRouter();

  useEffect(() => {
    if (!appInstances) return;
    const workspaceApps = appInstances.get(workspace.id);
    if (!workspaceApps) return;

    setCurrentApp(
      workspaceApps.find((appInstance) => appInstance.slug === appId)
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

  const content = useMemo(() => {
    if (typeof appId !== 'string') return;

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

    return null;
  }, [appConfig, appId, block, onAppConfigUpdate, schema, workspace.id]);

  if (typeof appId !== 'string' || !currentApp) return null;

  return (
    <>
      <PageHeader
        title={
          <div className="flex flex-row items-center">
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} className="w-10 h-10 mr-2" alt={appId} />
            )}
            {localize(currentApp.appName)}
          </div>
        }
      />
      {content}
    </>
  );
};

Apps.getLayout = getLayout;
export default Apps;
