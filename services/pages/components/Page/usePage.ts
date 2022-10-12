import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api, { Events } from '../../../console/utils/api';
import { useUser } from '../../../console/components/UserProvider';

export const usePage = (page: Prismeai.Page) => {
  const { user } = useUser();
  const [events, setEvents] = useState<Events>();
  const [blocksConfigs, setBlocksConfigs] = useState<
    NonNullable<Prismeai.Page['blocks'][number]['config']>[]
  >([]);

  // Init blocks config
  useEffect(() => {
    setBlocksConfigs((page.blocks || []).map(({ config }) => config || {}));
  }, [page]);

  // init socket
  const prevSocketWorkspaceId = useRef('');
  useEffect(() => {
    async function initEvents() {
      if (
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
  }, [page.id, page.workspaceId]);
  useEffect(() => {
    return () => {
      events?.destroy();
    };
  }, [events]);

  useEffect(() => {
    if (!events) return;
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

    const off = events.all((e, { payload }) => {
      if (Object.keys(updateEvents).includes(e)) {
        if (payload.userTopics) {
          events.listenTopics(payload.userTopics);
        }
        setBlocksConfigs((configs) => {
          const newConfigs = [...configs];
          (updateEvents[e] || []).forEach((id) => {
            newConfigs[id] = { ...newConfigs[id], ...payload };
          });
          return newConfigs;
        });
      }
    });

    (page.blocks || []).forEach(({ config, config: { onInit } = {} }) => {
      if (onInit) {
        const payload: any = {
          page: page.id,
          config,
        };
        if (window.location.search) {
          payload.query = Array.from(
            new URLSearchParams(window.location.search).entries()
          ).reduce(
            (prev, [key, value]) => ({
              ...prev,
              [key]: value,
            }),
            {}
          );
        }
        events.emit(onInit, payload);
      }
    });

    return () => {
      off();
    };
  }, [events, page.blocks, page.id]);

  // Init automation
  useEffect(() => {
    const initWithAutomation = async (
      workspaceId: string,
      automation: string,
      index: number
    ) => {
      try {
        const res = await api.callAutomation(workspaceId, automation);
        setBlocksConfigs((blocksConfigs) => {
          const newBlocksConfigs = [...blocksConfigs];
          newBlocksConfigs[index] = { ...newBlocksConfigs[index], ...res };
          return newBlocksConfigs;
        });
      } catch {}
    };
    (page.blocks || []).forEach(({ config: { automation } = {} }, index) => {
      if (!automation || !page.workspaceId) return;
      initWithAutomation(page.workspaceId, automation, index);
    });
  }, [page]);

  return { blocksConfigs, events };
};

export default usePage;
