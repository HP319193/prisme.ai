import { useCallback, useEffect, useRef, useState } from 'react';
import api, { Events } from '../../utils/api';
import { useUser } from '../UserProvider';

const isPage = (page: any): page is Prismeai.Page =>
  page && typeof page !== 'number';

export const usePageBlocksConfigs = (page: Prismeai.Page | null | number) => {
  const { user } = useUser();
  const [blocksConfigs, setBlocksConfigs] = useState<any[]>([]);

  const [cachedPage, setCachedPage] = useState(page);

  useEffect(() => {
    if (typeof cachedPage === 'number' || typeof page === 'number') {
      return;
    }
    if ((cachedPage || {}).id !== (page || {}).id) {
      setCachedPage(page);
    }
  }, [cachedPage, page]);

  useEffect(() => {
    if (!isPage(cachedPage)) return;
    setBlocksConfigs((cachedPage.blocks || []).map(({ config }) => config));
  }, [cachedPage]);

  const [socket, setSocket] = useState<Events>();
  const off = useRef<Function>();
  const [error, setError] = useState(false);

  const prevSocket = useRef<Events>();
  const initSocket = useCallback(async () => {
    if (!user || (prevSocket.current && prevSocket.current === socket)) return;
    off.current && off.current();

    const page = cachedPage;
    if (!isPage(page) || !page.workspaceId) return;
    const socketAlreadyInstantiatedForWorkspace =
      socket && socket.workspaceId === page.workspaceId;

    if (!socketAlreadyInstantiatedForWorkspace) {
      if (socket) {
        socket.destroy();
      }
      try {
        prevSocket.current = await api.streamEvents(page.workspaceId, {
          'source.sessionId': true,
        });
        setSocket(prevSocket.current);
        setError(false);
      } catch (e) {
        setError(true);
      }
    }

    if (!prevSocket.current) return null;

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

    off.current = prevSocket.current.all((e, { payload }) => {
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

    (page.blocks || []).forEach(({ config, config: { onInit } = {} }) => {
      if (!prevSocket.current) return;
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
        prevSocket.current.emit(onInit, payload);
      }
    });
  }, [cachedPage, socket, user]);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  useEffect(() => {
    return () => {
      off.current && off.current();
    };
  }, []);

  const initWithAutomation = useCallback(
    async (workspaceId: string, automation: string, index: number) => {
      try {
        const res = await api.callAutomation(workspaceId, automation);
        setBlocksConfigs((blocksConfigs) => {
          const newBlocksConfigs = [...blocksConfigs];
          newBlocksConfigs[index] = { ...newBlocksConfigs[index], ...res };
          return newBlocksConfigs;
        });
      } catch {}
    },
    []
  );
  useEffect(() => {
    const page = cachedPage;
    if (!isPage(page)) return;
    (page.blocks || []).forEach(({ config: { automation } = {} }, index) => {
      if (!automation || !page.workspaceId) return;

      initWithAutomation(page.workspaceId, automation, index);
    });
  }, [cachedPage, initWithAutomation]);

  return { blocksConfigs, error, events: socket };
};

export default usePageBlocksConfigs;
