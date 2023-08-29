import { BlockLoader as BLoader, TBlockLoader } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useUser } from '../../../console/components/UserProvider';
import api from '../../../console/utils/api';
import { computeBlocks } from './computeBlocks';
import { usePage } from './PageProvider';
import { useDebug } from './useDebug';
import fastDeepEqual from 'fast-deep-equal';
import isServerSide from '../../utils/isServerSide';

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

const recursiveConfigContext = createContext<Record<string, any>>({});
const useRecursiveConfigContext = () => useContext(recursiveConfigContext);

const automationCache = new Map<string, Promise<any>>();
async function callAutomation(
  workspaceId: string,
  automation: string,
  query: any
) {
  const key = JSON.stringify({ workspaceId, automation, query });
  if (!automationCache.has(key)) {
    automationCache.set(
      key,
      await api.callAutomation(workspaceId, automation, query)
    );
  }
  return automationCache.get(key);
}

export const BlockLoader: TBlockLoader = ({
  name = '',
  config: initialConfig,
  onLoad,
  container,
}) => {
  const { user } = useUser();
  const [appConfig, setAppConfig] = useState<any>();
  const { page, events } = usePage();
  const [loaded, setLoaded] = useState(false);
  const {
    i18n: { language },
  } = useTranslation();
  const lock = useRef(false);
  const [listening, setListening] = useState(false);
  const recursiveConfig = useRecursiveConfigContext();
  const [config, setConfig] = useState(initialConfig);

  const debug = useDebug();

  const prevInitialConfig = useRef(initialConfig);

  // These values must be computed on the first render to make page rendered
  // on server side
  const { blockName, computedConfig, url } = useMemo(() => {
    if (!fastDeepEqual(prevInitialConfig.current, config)) {
      prevInitialConfig.current = config;
    }
    const output = {
      blockName: name,
      url: '',
      computedConfig:
        prevInitialConfig.current &&
        computeBlocks(prevInitialConfig.current, recursiveConfig),
    };
    if (!name) return output;
    if (name.match(/^http/)) {
      return {
        ...output,
        url: name,
      };
    }

    const parts = name.split(/\./);

    const { blocks: workspaceBlocks } =
      (page?.appInstances || []).find(({ slug }) => slug === '') || {};

    if (workspaceBlocks && workspaceBlocks[name]) {
      const block = workspaceBlocks[name];
      const {
        url = getBlockName('BlocksList'),
        blocks = undefined,
        ...props
      } = typeof block === 'string' ? { url: block } : block;

      if (blocks) {
        return {
          ...output,
          blockName: 'BlocksList',
          computedConfig: computeBlocks(
            {
              ...initialConfig,
              blocks,
              ...props,
            },
            recursiveConfig
          ),
        };
      }
      return output;
    }
    if (parts.length === 1) {
      return output;
    }

    const [appSlug] = parts;
    const app = (page?.appInstances || []).find(({ slug }) => appSlug === slug);
    if (!app || !app.blocks?.[name]) {
      console.error(`"${name}" Block is not installed`);
      return output;
    }

    const debugUrl = debug.get(name);
    const b = app.blocks[name];
    const block = typeof b === 'string' ? { url: b } : b;
    if (debugUrl) {
      block.url = debugUrl;
    }

    const {
      url = getBlockName('BlocksList'),
      blocks = undefined,
      ...props
    } = block;

    if (blocks) {
      return {
        ...output,
        blockName: 'BlocksList',
        computedConfig: computeBlocks(
          {
            ...initialConfig,
            blocks,
            ...props,
          },
          recursiveConfig
        ),
      };
    }
    return {
      ...output,
      url,
    };
  }, [config, name, recursiveConfig, page?.appInstances, debug, initialConfig]);

  const { onInit, updateOn, automation } = initialConfig || {};
  const onBlockLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const initWithAutomation = useCallback(async () => {
    if (!user || !page || !page.workspaceId || !loaded) return;
    try {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const query = {
        pageSlug: page.slug,
        ...Object.fromEntries(urlSearchParams.entries()),
      };

      const newConfig = await callAutomation(
        page.workspaceId,
        automation,
        query
      );
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
          setConfig((prev = {}) => {
            const newConfig = { ...prev, ...config };
            if (fastDeepEqual(newConfig, prev)) return prev;
            return newConfig;
          });
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
      language,
    };
    if (window.location.hash && !payload.hash) {
      payload.hash = window.location.hash;
    }
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
  }, [events, initialConfig, language, listening, onInit, page, user]);

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

  // This lines force browser to re render page and regenerate classnames
  const [render, setRender] = useState(isServerSide());
  useEffect(() => {
    setRender(true);
  }, []);

  const cumulatedConfig = useMemo(
    () => ({
      ...recursiveConfig,
      ...computedConfig,
    }),
    [computedConfig, recursiveConfig]
  );
  console.log({ render });
  if (!page || !render) return null;
  console.log({ blockName, url, language });
  return (
    <recursiveConfigContext.Provider value={cumulatedConfig}>
      <BLoader
        name={getBlockName(blockName)}
        url={url}
        appConfig={appConfig}
        onAppConfigUpdate={onAppConfigUpdate}
        api={api}
        language={language}
        workspaceId={`${page.workspaceId}`}
        events={events}
        config={computedConfig}
        layout={{
          container,
        }}
        onLoad={onBlockLoad}
      />
    </recursiveConfigContext.Provider>
  );
};

export default BlockLoader;
