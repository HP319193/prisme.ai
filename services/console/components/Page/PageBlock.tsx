import { BlockLoader, BlockLoaderProps } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import api, { Events } from '../../utils/api';
import useAppConfig from '../../utils/useAppConfig';
import usePageBlocksConfigs from './usePageBlocksConfigs';

interface PublicPageBlockProps {
  url: BlockLoaderProps['url'];
  name: BlockLoaderProps['name'];
  workspaceId: string;
  appInstance: string;
  blockIndex: number;
  page: Prismeai.DetailedPage;
  events?: Events;
}

const PageBlock = ({
  url,
  name,
  workspaceId,
  appInstance,
  blockIndex,
  page,
  events,
}: PublicPageBlockProps) => {
  const { blocksConfigs } = usePageBlocksConfigs(page);
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
      config={blocksConfigs[blockIndex]}
      onAppConfigUpdate={onAppConfigUpdate}
      api={api}
      name={name}
    />
  );
};

export default PageBlock;
