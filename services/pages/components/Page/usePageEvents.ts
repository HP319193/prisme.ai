import { useEffect, useRef, useState } from 'react';
import { useUser } from '../../../console/components/UserProvider';
import api, { Events } from '../../../console/utils/api';

function resetBlocksConfig(
  page: Prismeai.Page,
  initialConfig: Record<string, any>[] = []
) {
  return (page.blocks || []).map(({ config }, index) => ({
    ...(config || {}),
    ...(initialConfig[index] || {}),
  }));
}

export const usePageEvents = (
  page: Prismeai.Page | null,
  initialConfig: Record<string, any>[] = []
) => {
  const { user } = useUser();
  const [events, setEvents] = useState<Events>();
  const [blocksConfigs, setBlocksConfigs] = useState<
    NonNullable<Prismeai.Page['blocks']>[number]['config'][]
  >(page ? resetBlocksConfig(page, initialConfig) : []);

  // Init blocks config
  useEffect(() => {
    if (!page) return;
    setBlocksConfigs(resetBlocksConfig(page));
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
  }, [page, user]);
  useEffect(() => {
    return () => {
      events?.destroy();
    };
  }, [events]);

  return { blocksConfigs, events };
};

export default usePageEvents;
