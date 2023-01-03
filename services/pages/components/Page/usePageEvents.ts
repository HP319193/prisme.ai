import { useEffect, useRef, useState } from 'react';
import api, { Events } from '../../../console/utils/api';

export const usePageEvents = (page: Prismeai.Page | null) => {
  const [events, setEvents] = useState<Events>();
  const [blocksConfigs, setBlocksConfigs] = useState<
    NonNullable<Prismeai.Page['blocks']>[number]['config'][]
  >([]);

  // Init blocks config
  useEffect(() => {
    if (!page) return;
    setBlocksConfigs((page.blocks || []).map(({ config }) => config || {}));
  }, [page]);

  // init socket
  const prevSocketWorkspaceId = useRef('');
  useEffect(() => {
    async function initEvents() {
      if (
        !page ||
        !page.workspaceId ||
        prevSocketWorkspaceId.current === page.workspaceId
      )
        return;
      const events = await api.streamEvents(page.workspaceId, {
        'source.sessionId': true,
      });

      prevSocketWorkspaceId.current = page.workspaceId;
      setEvents((prev) => {
        if (prev) {
          prev.destroy();
        }
        return events;
      });
    }
    initEvents();
  }, [page]);
  useEffect(() => {
    return () => {
      events?.destroy();
    };
  }, [events]);

  return { blocksConfigs, events };
};

export default usePageEvents;
