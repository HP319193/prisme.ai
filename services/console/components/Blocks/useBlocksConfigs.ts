import { useCallback, useEffect, useRef, useState } from 'react';
import api, { Events } from '../../utils/api';

export const useBlocksConfigs = (page: Prismeai.Page | null) => {
  const [blocksConfigs, setBlocksConfigs] = useState<any[]>([]);

  useEffect(() => {
    if (!page) return;
    setBlocksConfigs((page.blocks || []).map(({ config }) => config));
  }, [page]);

  const socket = useRef<Events>();
  const off = useRef<Function>();
  const [error, setError] = useState(false);

  const initSocket = useCallback(async () => {
    if (!page || !page.workspaceId) return;
    const socketAlreadyInstantiatedForId =
      socket.current && socket.current.workspaceId === page.workspaceId;

    if (!page.workspaceId || socketAlreadyInstantiatedForId) {
      return;
    }
    if (socket.current) {
      socket.current.destroy();
    }
    try {
      socket.current = await api.streamEvents(page.workspaceId);
      setError(false);
    } catch (e) {
      setError(true);
      return null;
    }

    const s = socket.current;

    const updateEvents = (page.blocks || []).reduce<Record<string, number[]>>(
      (prev, { config }, index) =>
        !config || !config.updateOn
          ? prev
          : {
              ...prev,
              [config.updateOn]: [...(prev[config.updateOn] || []), index],
            },
      {}
    );

    off.current = socket.current.all((e, { payload }) => {
      if (Object.keys(updateEvents).includes(e)) {
        setBlocksConfigs((configs) => {
          const newConfigs = [...configs];
          (updateEvents[e] || []).forEach((id) => {
            newConfigs[id] = { ...newConfigs[id], ...payload };
          });
          return newConfigs;
        });
      }
    });

    (page.blocks || []).forEach(({ config: { onInit } = {} }) => {
      if (onInit) {
        s.emit(onInit, {
          page: page.id,
        });
      }
    });
  }, [page]);

  useEffect(() => {
    initSocket();
    return () => {
      off.current && off.current();
    };
  }, [initSocket, page]);

  return [blocksConfigs, error];
};

export default useBlocksConfigs;
