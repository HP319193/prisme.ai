import { useCallback, useEffect, useState } from 'react';
import { BlockLoaderProps } from '@prisme.ai/blocks';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import api from '../../utils/api';

interface BlockConfigProviderProps {
  workspaceId: string;
  blockId?: string;
  appInstance?: BlockLoaderProps['appInstance'];
}

const useBlockAppConfig = ({
  workspaceId,
  appInstance,
}: BlockConfigProviderProps) => {
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

export default useBlockAppConfig;
