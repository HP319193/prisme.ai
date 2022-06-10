import { BlockLoader, BlockLoaderProps } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import api from '../../utils/api';
import useAppConfig from '../../utils/useAppConfig';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import usePageBlocksConfigs from './usePageBlocksConfigs';

interface PublicPageBlockProps {
  url: BlockLoaderProps['url'];
  name: BlockLoaderProps['name'];
  workspaceId: string;
  appInstance: string;
  blockIndex: number;
  page: Prismeai.DetailedPage;
}

const PageBlock = ({
  url,
  name,
  workspaceId,
  appInstance,
  blockIndex,
  page,
}: PublicPageBlockProps) => {
  const { socket } = useWorkspace();
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
      events={socket}
      config={blocksConfigs[blockIndex]}
      onAppConfigUpdate={onAppConfigUpdate}
      api={api}
      name={name}
    />
  );
};

export default PageBlock;
