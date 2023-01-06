import { BlockLoader as BLoader, TBlockLoader } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../../console/utils/api';
import { usePage } from './PageProvider';

export const BlockLoader: TBlockLoader = ({
  name = '',
  config: initialConfig,
  onLoad,
  container,
}) => {
  const [url, setUrl] = useState('');
  const [config, setConfig] = useState<typeof initialConfig>();
  const [appConfig, setAppConfig] = useState<any>();
  const { page, events } = usePage();
  const [loaded, setLoaded] = useState(false);
  const {
    i18n: { language },
  } = useTranslation();
  const lock = useRef(false);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    if (lock.current || !name) return;
    if (name.match(/^http/)) {
      setUrl(name);
      return;
    }

    const parts = name.split(/\./);

    if (parts.length === 1) {
      const { blocks: workspaceBlocks } =
        (page?.appInstances || []).find(({ slug }) => slug === '') || {};
      if (workspaceBlocks && workspaceBlocks[name]) {
        setUrl(workspaceBlocks[name]);
        return;
      }
      setUrl(name);
      return;
    }

    const [appSlug] = parts;
    const app = (page?.appInstances || []).find(({ slug }) => appSlug === slug);
    if (!app || !app.blocks?.[name]) {
      console.error(`"${name}" Block is not installed`);
      return;
    }
    setAppConfig(app.appConfig);
    setUrl(app.blocks[name]);
  }, [name, page]);

  const { onInit, updateOn, automation } = initialConfig || {};
  const onBlockLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const initWithAutomation = useCallback(async () => {
    if (!page || !page.workspaceId || !loaded) return;
    try {
      const newConfig = await api.callAutomation(page.workspaceId, automation);
      setConfig((prev = {}) => ({ ...prev, ...newConfig }));
    } catch {}
  }, [automation, loaded, page]);

  useEffect(() => {
    if (!loaded || !events) return;
    onLoad && onLoad();
    // Set listeners
    let off: Function[] = [];
    if (updateOn) {
      off.push(
        events.on(updateOn, ({ payload: config }) => {
          setConfig((prev = {}) => ({ ...prev, ...config }));
          if (config.userTopics) {
            events.listenTopics(config.userTopics);
          }
        })
      );
    }

    if (onInit) {
      const payload: any = {
        page: page && page.id,
        config: initialConfig,
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

    if (automation) {
      initWithAutomation();
    }

    return () => {
      off.forEach((off) => off());
    };
  }, [
    events,
    onLoad,
    updateOn,
    onInit,
    page,
    initialConfig,
    loaded,
    automation,
    initWithAutomation,
  ]);

  const onAppConfigUpdate = useCallback(
    async (newConfig: any) => {
      lock.current = true;
      setAppConfig(() => newConfig);
      if (name.match(/^http/) || !name.match(/\./)) return;
      const [appInstance] = name.split(/\./);
      if (!page?.workspaceId || !appInstance) return;
      return api.updateAppConfig(page.workspaceId, appInstance, newConfig);
    },
    [name, page]
  );

  if (!page) return null;

  return (
    <BLoader
      name={name}
      url={url}
      appConfig={appConfig}
      onAppConfigUpdate={onAppConfigUpdate}
      api={api}
      language={language}
      workspaceId={`${page.workspaceId}`}
      events={events}
      config={config}
      layout={{
        container,
      }}
      onLoad={onBlockLoad}
    />
  );
};

export default BlockLoader;
