import { useCallback, useMemo } from 'react';
import { usePageBuilder } from './context';
import { useWorkspace } from '../../layouts/WorkspaceLayout';

interface BlockConfigProviderProps {
  blockId: string;
}

const useBlockPageConfig = ({ blockId }: BlockConfigProviderProps) => {
  const { setBlockConfig, page, events } = usePageBuilder();

  const config = useMemo(
    () =>
      ((page.blocks || []).find(({ key }) => blockId === key) || {}).config ||
      {},
    [page.blocks, blockId]
  );
  const onConfigUpdate = useCallback(
    (config: any) => {
      if (!blockId) {
        return;
      }
      setBlockConfig(blockId, config);
    },
    [blockId, setBlockConfig]
  );

  return {
    config,
    onConfigUpdate,
    events,
  };
};

export default useBlockPageConfig;
