import { BlockLoader as BLoader, TBlockLoader } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useUser } from '../../../console/components/UserProvider';
import api from '../../../console/utils/api';
import { computeBlock, original } from './computeBlocks';
import { usePage } from './PageProvider';
import { useDebug } from './useDebug';
import fastDeepEqual from 'fast-deep-equal';
import isServerSide from '../../../console/utils/isServerSide';
import { useRedirect } from './useRedirect';
import { applyCommands } from './commands';
import { useRouter } from 'next/router';

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

export const recursiveConfigContext = createContext<Record<string, any>>({});
export const useRecursiveConfigContext = () =>
  useContext(recursiveConfigContext);

async function callAutomation(
  workspaceId: string,
  automation: Prismeai.Block['automation'],
  query: any
) {
  const { slug, payload = {} } =
    !automation || typeof automation === 'string'
      ? { slug: automation }
      : automation;

  if (!slug) return;

  return await api.callAutomation(workspaceId, slug, {
    ...query,
    ...computeBlock(payload, query),
  });
}
export const BlockLoader: (
  props: Parameters<TBlockLoader>[0] & {
    component?: (props: any) => JSX.Element | null;
  }
) => ReturnType<TBlockLoader> = ({
  name = '',
  config: initialConfig,
  onLoad,
  container,
  component,
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
  useEffect(() => {
    if (!fastDeepEqual(prevInitialConfig.current, initialConfig)) {
      prevInitialConfig.current = initialConfig;
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  // These values must be computed on the first render to make page rendered
  // on server side
  const prevConfig = useRef(config);
  const { blockName, computedConfig, url } = useMemo(() => {
    if (!fastDeepEqual(prevConfig.current, config)) {
      prevConfig.current = config;
    }
    const output = {
      blockName: name,
      url: '',
      computedConfig:
        prevConfig.current && computeBlock(prevConfig.current, recursiveConfig),
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

      if (typeof block === 'string') {
        return {
          ...output,
          url: block,
        };
      }

      // This should be rewrote as a WorkspaceBlock Component
      return {
        ...output,
        ...block,
        computedConfig: computeBlock(
          {
            ...prevConfig.current,
            ...block,
          },
          recursiveConfig,
          true // merged from a templated Block and a config, so there should
          // not exist any original here
        ),
        blockName: 'BlocksList',
      };
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
    const appBlock = typeof b === 'string' ? { url: b } : b;
    if (debugUrl) {
      appBlock.url = debugUrl;
    }

    if (appBlock.url) {
      const {
        url = getBlockName('BlocksList'),
        blocks = undefined,
        ...props
      } = appBlock;

      if (blocks && blocks.length > 0) {
        return {
          ...output,
          blockName: 'BlocksList',
          computedConfig: computeBlock(
            {
              ...output.computedConfig,
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
    }

    // This should be rewrote as a WorkspaceBlock Component
    return {
      ...output,
      ...appBlock,
      computedConfig: computeBlock(
        {
          ...prevConfig.current,
          ...appBlock,
        },
        recursiveConfig,
        true // merged from a templated Block and a config, so there should
        // not exist any original here
      ),
      blockName: 'BlocksList',
    };
  }, [config, name, recursiveConfig, page?.appInstances, debug]);

  const { onInit, updateOn, automation } = computedConfig || {};
  const onBlockLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const redirect = useRedirect();
  const automationLoadingState = useRef(-1);
  const { query } = useRouter();
  const initWithAutomation = useRef(() => {});
  useEffect(() => {
    initWithAutomation.current = async () => {
      if (
        !user ||
        !page ||
        !page.workspaceId ||
        automationLoadingState.current > -1 ||
        !events
      )
        return;

      try {
        automationLoadingState.current = 0;
        const urlSearchParams = new URLSearchParams(window.location.search);
        const query = {
          pageSlug: page.slug,
          ...Object.fromEntries(urlSearchParams.entries()),
          ...computedConfig,
        };

        delete query.blocks;
        const newConfig = await callAutomation(
          page.workspaceId,
          automation,
          query
        );
        redirect(newConfig);
        setConfig(({ [original]: ignore = null, ...prev } = {}) => ({
          ...prev,
          ...newConfig,
        }));
        if (updateOn && newConfig.userTopics) {
          events.listenTopics({
            event: updateOn,
            topics: newConfig.userTopics,
          });
        }
      } catch {}
      automationLoadingState.current = 1;
    };
  }, [automation, computedConfig, events, page, redirect, updateOn, user]);

  // This is needed to re-init block when page navigate without reloading
  // by changing query string
  const unmount = useRef(false);
  useEffect(() => {
    return () => {
      unmount.current = true;
    };
  }, []);
  const refetch = useRef(() => {
    setTimeout(() => {
      if (automation && !unmount.current) {
        automationLoadingState.current = -1;
        initWithAutomation.current();
      }
    });
  });
  useEffect(() => {
    refetch.current();
  }, [query]);

  useEffect(() => {
    if (!user || !loaded || !events) return;
    onLoad && onLoad();
    // Set listeners
    let off: Function[] = [];
    if (updateOn) {
      off.push(
        events.on(updateOn, ({ payload: config }) => {
          setConfig((prev = {}) => {
            const newConfig = applyCommands(prev, config);

            if (fastDeepEqual(newConfig, prev)) return prev;
            const newBlock = computeBlock(
              newConfig,
              { ...recursiveConfig },
              true
            );
            return newBlock;
          });
          if (config.userTopics) {
            events.listenTopics({ event: updateOn, topics: config.userTopics });
          }
        })
      );
    }
    setListening(true);

    if (automation) {
      initWithAutomation.current();
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
    recursiveConfig,
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
    const { event, payload: staticPayload = {} } =
      typeof onInit === 'string' ? { event: onInit } : onInit;
    events.emit(event, { ...staticPayload, ...payload });
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

  if (!page || !render) return null;
  if (computedConfig?.hidden) {
    return null;
  }
  const Component = component;

  return (
    <recursiveConfigContext.Provider value={cumulatedConfig}>
      {Component && <Component />}
      {!Component && (
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
      )}
    </recursiveConfigContext.Provider>
  );
};

export default BlockLoader;
