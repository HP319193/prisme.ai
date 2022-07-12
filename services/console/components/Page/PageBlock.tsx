import { BlockLoader, BlockLoaderProps } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import api, { Events } from '../../utils/api';
import useAppConfig from '../../utils/useAppConfig';

interface PublicPageBlockProps {
  url: BlockLoaderProps['url'];
  name: BlockLoaderProps['name'];
  workspaceId: string;
  appInstance: string;
  page: Prismeai.DetailedPage;
  events?: Events;
  config?: any;
  container?: HTMLElement;
}

const PageBlock = ({
  url,
  name,
  workspaceId,
  appInstance,
  events,
  config,
  container,
}: PublicPageBlockProps) => {
  const { appConfig, onAppConfigUpdate } = useAppConfig({
    workspaceId,
    appInstance,
  });

  const {
    i18n: { language },
  } = useTranslation('pages');

  return (
    <BlockLoader
      url={url}
      language={language}
      token={api.token || undefined}
      workspaceId={workspaceId}
      appInstance={appInstance}
      appConfig={appConfig}
      events={events}
      config={config}
      onAppConfigUpdate={onAppConfigUpdate}
      api={api}
      name={name}
      layout={{
        container,
      }}
    />
  );
};

export default PageBlock;
