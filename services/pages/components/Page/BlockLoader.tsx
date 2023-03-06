import { BlockLoader as BLoader, TBlockLoader } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '../../../console/components/UserProvider';
import api from '../../../console/utils/api';
import Storage from '../../../console/utils/Storage';
import { usePage } from './PageProvider';
import { useDebug } from './useDebug';

/**
 * This function aims to replace deprecated Block names by the new one
 */
function getBlockName(name: string) {
  switch (name) {
    case 'Layout':
      return 'StackedNavigation';
    default:
      return name;
  }
}

export const BlockLoader: TBlockLoader = ({
  name = '',
  config: initialConfig,
  onLoad,
  container,
}) => {
  const { user } = useUser();
  const [url, setUrl] = useState('');
  const [config, setConfig] = useState<typeof initialConfig>(initialConfig);
  const [appConfig, setAppConfig] = useState<any>();
  const { page, events } = usePage();
  const [loaded, setLoaded] = useState(false);
  const {
    i18n: { language },
  } = useTranslation();
  const lock = useRef(false);
  const [listening, setListening] = useState(false);

  const debug = useDebug();

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
      setUrl(getBlockName(name));
      return;
    }

    const [appSlug] = parts;
    const app = (page?.appInstances || []).find(({ slug }) => appSlug === slug);
    if (!app || !app.blocks?.[name]) {
      console.error(`"${name}" Block is not installed`);
      return;
    }

    const debugUrl = debug.get(name);
    if (debugUrl) {
      app.blocks[name] = debugUrl;
    }
    setAppConfig(app.appConfig);
    setUrl(app.blocks[name]);
  }, [debug, name, page]);

  const { onInit, updateOn, automation } = initialConfig || {};
  const onBlockLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const initWithAutomation = useCallback(async () => {
    if (!user || !page || !page.workspaceId || !loaded) return;
    try {
      const newConfig = await api.callAutomation(page.workspaceId, automation);
      setConfig((prev = {}) => ({ ...prev, ...newConfig }));
    } catch {}
  }, [automation, loaded, page, user]);

  useEffect(() => {
    if (!user || !loaded || !events) return;
    onLoad && onLoad();
    // Set listeners
    let off: Function[] = [];
    if (updateOn) {
      off.push(
        events.on(updateOn, ({ payload: config }) => {
          setConfig((prev = {}) => ({ ...prev, ...config }));
          if (config.userTopics) {
            events.listenTopics({ event: updateOn, topics: config.userTopics });
          }
        })
      );
    }
    setListening(true);

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
    user,
  ]);

  const alreadySentInit = useRef(false);
  useEffect(() => {
    if (!user || !listening || !events || alreadySentInit.current || !onInit)
      return;
    alreadySentInit.current = true;
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
  }, [events, initialConfig, listening, onInit, page, user]);

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
      name={getBlockName(name)}
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
