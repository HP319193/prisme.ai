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
}

const PageBlock = ({
  url,
  name,
  workspaceId,
  appInstance,
  events,
  config,
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
    />
  );
};

export default PageBlock;
