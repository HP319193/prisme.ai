import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { BlockProvider } from '@prisme.ai/design-system';
import { usePageBuilder } from './context';
import api from '../../utils/api';
import { useWorkspace } from '../../layouts/WorkspaceLayout';

interface PageBlockProviderProps {
  blockId: string;
  appInstance?: string;
  workspaceId: string;
  children: ReactNode;
}

const PageBlockProvider = ({
  blockId,
  appInstance,
  workspaceId,
  children,
}: PageBlockProviderProps) => {
  const { setBlockConfig, page } = usePageBuilder();
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
    <BlockProvider
      config={config}
      onConfigUpdate={setConfigHandler}
      appConfig={appConfig}
      onAppConfigUpdate={setAppConfigHandler}
    >
      {children}
    </BlockProvider>
  );
};

export default PageBlockProvider;
