import { useCallback, useEffect, useState } from 'react';
import { BlockLoaderProps } from '@prisme.ai/blocks';
import api from './api';
import { useWorkspace } from '../components/WorkspaceProvider';

const useAppConfig = (
  workspaceId: string,
  appInstance: BlockLoaderProps['appInstance']
) => {
  const [appConfig, setAppConfig] = useState<any>();
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (!appInstance || !workspaceId) {
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
      if (!workspaceId || !appInstance) return;
      await api.updateAppConfig(workspaceId, appInstance, newConfig);
    },
    [appInstance, workspaceId]
  );

  return {
    appConfig,
    onAppConfigUpdate,
  };
};

export default useAppConfig;
