import { BlockLoader, BlockLoaderProps } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import api from '../../utils/api';
import useBlockAppConfig from './useBlockAppConfig';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import usePublicBlocksConfigs from './usePublicBlocksConfigs';

interface PublicPageBlockProps {
  url: BlockLoaderProps['url'];
  name: BlockLoaderProps['name'];
  workspaceId: string;
  appInstance: string;
  blockIndex: number;
  page: Prismeai.DetailedPage;
}

const PublicPageBlock = ({
  url,
  name,
  workspaceId,
  appInstance,
  blockIndex,
  page,
}: PublicPageBlockProps) => {
  const { socket } = useWorkspace();
  const { blocksConfigs } = usePublicBlocksConfigs(page);
  const { appConfig, onAppConfigUpdate } = useBlockAppConfig({
    workspaceId,
    appInstance,
  });

  const {
    t,
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

export default PublicPageBlock;
