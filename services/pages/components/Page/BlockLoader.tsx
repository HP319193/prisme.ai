import { TBlockLoader, BlockLoader as BLoader } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';
import api from '../../../console/utils/api';
import { usePage } from './PageProvider';

export const BlockLoader: TBlockLoader = ({
  name = '',
  config,
  onLoad,
  container,
}) => {
  const [url, setUrl] = useState('');
  const [appConfig, setAppConfig] = useState<any>();
  const { page, events } = usePage();
  const {
    i18n: { language },
  } = useTranslation();

  useEffect(() => {
    if (name.match(/^http/)) {
      setUrl(name);
      return;
    }

    const parts = name.split(/\./);

    if (parts.length === 1) {
      setUrl(name);
      return;
    }

    const [appSlug] = parts;
    const app = (page?.appInstances || []).find(({ slug }) => appSlug === slug);

    if (!app || !app.blocks[name]) {
      console.error(`"${name}" Block is not installed`);
      return;
    }

    setAppConfig(app.appConfig);
    setUrl(app.blocks[name]);
  }, [name, page]);

  const onBlockLoad = useCallback(() => {
    onLoad && onLoad();
    if (!events || !config || !config.onInit) return;
    events.emit(config.onInit);
  }, [events, onLoad, config]);

  if (!page) return null;

  return (
    <BLoader
      name={name}
      url={url}
      appConfig={appConfig}
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