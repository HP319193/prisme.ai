import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { BlockLoader, BlockLoaderProps } from '@prisme.ai/blocks';
import { usePageBuilder } from './context';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import api, * as prismeaiSDK from '../../utils/api';
import { Loading } from '@prisme.ai/design-system';

interface PageBlockProviderProps {
  blockId: string;
  workspaceId: string;
  children?: ReactNode;
  url?: BlockLoaderProps['url'];
  onLoad?: BlockLoaderProps['onLoad'];
  entityId: BlockLoaderProps['entityId'];
  appInstance?: BlockLoaderProps['appInstance'];
  language?: BlockLoaderProps['language'];
  edit?: BlockLoaderProps['edit'];
}

const PageBlockProvider = ({
  blockId,
  appInstance,
  workspaceId,
  children,
  onLoad,
  ...BlockLoaderProps
}: PageBlockProviderProps) => {
  const { setBlockConfig, page, events } = usePageBuilder();
  const [appConfig, setAppConfig] = useState<any>();
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (!appInstance) {
      if (workspace && workspace.config) {
        setAppConfig(workspace.config.value);
      }
      return;
    }
    const fetchAppConfig = async () => {
      try {
        const appConfig = await api.getAppConfig(workspaceId, appInstance);
        setAppConfig(appConfig || null);
      } catch {
        return;
      }
    };
    fetchAppConfig();
  }, [appInstance, workspace, workspaceId]);
  const setAppConfigHandler = useCallback(
    async (newConfig: any) => {
      setAppConfig(() => newConfig);
      if (!page.workspaceId || !appInstance) return;
      await api.updateAppConfig(page.workspaceId, appInstance, newConfig);
    },
    [appInstance, page.workspaceId]
  );

  const config = useMemo(
    () =>
      ((page.blocks || []).find(({ key }) => blockId === key) || {}).config ||
      {},
    [page.blocks, blockId]
  );
  const setConfigHandler = useCallback(
    (config: any) => {
      setBlockConfig(blockId, config);
    },
    [blockId, setBlockConfig]
  );

  return (
    <BlockLoader
      config={config}
      onConfigUpdate={setConfigHandler}
      appConfig={appConfig}
      onAppConfigUpdate={setAppConfigHandler}
      events={events}
      token={`${api.token}`}
      renderLoading={
        <Loading className="bg-white absolute top-0 right-0 bottom-0 left-0" />
      }
      edit
      prismeaiSDK={prismeaiSDK}
      onLoad={onLoad}
      {...BlockLoaderProps}
    >
      {children}
    </BlockLoader>
  );
};

export default PageBlockProvider;
