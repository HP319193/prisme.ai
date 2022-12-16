import { useCallback, useMemo } from 'react';
import { usePageBuilder } from './context';

interface BlockConfigProviderProps {
  blockId: string;
}

const useBlockPageConfig = ({ blockId }: BlockConfigProviderProps) => {
  const { setBlockConfig, value } = usePageBuilder();

  const config = useMemo(
    () => ((value || []).find(({ key }) => blockId === key) || {}).config || {},
    [value, blockId]
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
  };
};

export default useBlockPageConfig;
