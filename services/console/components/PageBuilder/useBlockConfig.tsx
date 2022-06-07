import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loading } from '@prisme.ai/design-system';
import { BlockLoaderProps } from '@prisme.ai/blocks';
import { usePageBuilder } from './context';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import api from '../../utils/api';

interface BlockConfigProviderProps {
  blockId: string;
  workspaceId: string;
  name?: string;
  url?: BlockLoaderProps['url'];
  appInstance?: BlockLoaderProps['appInstance'];
  language?: BlockLoaderProps['language'];
  edit?: BlockLoaderProps['edit'];
}

const useBlockConfig = ({
  blockId,
  appInstance,
  workspaceId,
  ...BlockLoaderProps
}: BlockConfigProviderProps) => {
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
  const onAppConfigUpdate = useCallback(
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
  const onConfigUpdate = useCallback(
    (config: any) => {
      setBlockConfig(blockId, config);
    },
    [blockId, setBlockConfig]
  );

  return {
    config,
    appConfig,
    onConfigUpdate,
    onAppConfigUpdate,
    events,
    renderLoading: (
      <Loading className="bg-white absolute top-0 right-0 bottom-0 left-0" />
    ),
  };
};

export default useBlockConfig;
