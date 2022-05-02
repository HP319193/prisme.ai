import { ReactNode, useCallback, useMemo, useState } from 'react';
import { BlockProvider } from '@prisme.ai/design-system';
import { usePageBuilder } from './context';

interface PageBlockProviderProps {
  blockId: string;
  children: ReactNode;
}

const PageBlockProvider = ({ blockId, children }: PageBlockProviderProps) => {
  const { setBlockConfig, page } = usePageBuilder();
  const [appConfig, setAppConfig] = useState<any>();

  const setAppConfigHandler = useCallback(
    (newConfig: any) =>
      setAppConfig((config: any) => ({
        ...config,
        ...newConfig,
      })),
    []
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
