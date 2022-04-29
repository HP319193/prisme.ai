import { useEffect, useRef, useState } from 'react';
import api, { Events } from '../../utils/api';

export const useBlocksConfigs = (page: Prismeai.Page | null) => {
  const [blocksConfigs, setBlocksConfigs] = useState<any[]>([]);

  useEffect(() => {
    if (!page) return;
    setBlocksConfigs((page.blocks || []).map(({ config }) => config));
  }, [page]);

  const socket = useRef<Events>();
  useEffect(() => {
    if (!page || !page.workspaceId) return;
    const socketAlreadyInstantiatedForId =
      socket.current && socket.current.workspaceId === page.workspaceId;

    if (!page.workspaceId || socketAlreadyInstantiatedForId) {
      return;
    }
    if (socket.current) {
      socket.current.destroy();
    }
    socket.current = api.streamEvents(page.workspaceId);

    const off = socket.current.all((e, { payload }) => {
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

      if (Object.keys(updateEvents).includes(e)) {
        setBlocksConfigs((configs) => {
          const newConfigs = [...configs];
          (updateEvents[e] || []).forEach((id) => {
            newConfigs[id] = payload;
          });
          return newConfigs;
        });
      }
    });

    return () => {
      off();
    };
  }, [page]);

  // Init blocks
  useEffect(() => {
    if (!page || !page.workspaceId) return;
    const initEvents = (page.blocks || []).reduce<string[]>(
      (prev, { config }) =>
        !config || !config.onInit ? prev : [...prev, config.onInit],
      []
    );
    api.postEvents(
      page.workspaceId,
      initEvents.map((event) => ({
        type: event,
        payload: {
          page: page.id,
        },
      }))
    );
  }, [page]);

  return blocksConfigs;
};

export default useBlocksConfigs;
