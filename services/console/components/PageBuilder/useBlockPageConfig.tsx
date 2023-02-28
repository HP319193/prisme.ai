import { useCallback, useMemo } from 'react';
import { usePageBuilder } from './context';

interface BlockConfigProviderProps {
  blockId: string;
}

const useBlockPageConfig = ({ blockId }: BlockConfigProviderProps) => {
  const { setBlockConfig, value } = usePageBuilder();

  const config = useMemo(() => {
    const { config: oldSchoolConfig, ...config } = value.get(blockId) || {};
    return {
      ...oldSchoolConfig,
      ...config,
    };
  }, [value, blockId]);
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
