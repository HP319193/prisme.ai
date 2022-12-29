import { useCallback, useEffect, useState } from 'react';
import { BlockLoaderProps } from '@prisme.ai/blocks';
import api from './api';
import { useWorkspace } from '../providers/Workspace';

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
        if (!workspaceId) return;
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
      return api.updateAppConfig(workspaceId, appInstance, newConfig);
    },
    [appInstance, workspaceId]
  );

  return {
    appConfig,
    onAppConfigUpdate,
  };
};

export default useAppConfig;
