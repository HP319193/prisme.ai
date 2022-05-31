import api, * as prismeaiSDK from '../../utils/api';
import { usePageBuilder } from './context';
import { Loading } from '@prisme.ai/design-system';
import BlockLoader from '@prisme.ai/blocks';
import useLocalizedText from '../../utils/useLocalizedText';
import AddBlock from './AddBlock';
import EditBlock from './EditBlock';
import { truncate } from '../../utils/strings';
import PageBlockProvider from './PageBlockProvider';
import { useCallback } from 'react';

interface PageBlockProps {
  url?: string;
  component?: Function;
  id: string;
  title: string | React.ReactNode;
  workspaceId: string;
  appInstance?: string;
}

const PageBlockWithProvider = ({
  hovered,
  blockId,
  index,
  name,
  component: Component,
  url,
  id,
  workspaceId,
  appInstance,
}: PageBlockProps & {
  hovered: boolean;
  blockId: string;
  index: number;
  name?: Prismeai.LocalizedText;
}) => {
  const { localize } = useLocalizedText();
  const { setEditBlock, setBlockSchema } = usePageBuilder();
  const onLoad = useCallback(
    (module: any) => {
      if (!module.schema) return;
      setBlockSchema(blockId, module.schema);
    },
    [blockId, setBlockSchema]
  );

  return (
    <div className="flex grow flex-col max-w-full">
      <div className={`relative ${!hovered ? 'invisible' : ''}`}>
        <AddBlock after={index - 1} />
        <EditBlock onEdit={() => setEditBlock(blockId)} />
        <div className="absolute left-[-120px] top-[-10px] z-20 text-right w-[90px] text-gray">
          {truncate(localize(name), 10)}
        </div>
      </div>

      <div className="flex grow  relative flex-col surface-section border-slate-100 bg-white  border overflow-hidden z-2">
        <PageBlockProvider
          blockId={id}
          appInstance={appInstance}
          workspaceId={workspaceId}
          url={url}
          entityId={id}
          onLoad={onLoad}
        >
          {Component && <Component edit />}
        </PageBlockProvider>
      </div>

      <div className={`relative ${!hovered ? 'invisible' : ''}`}>
        <AddBlock after={index} />
      </div>
    </div>
  );
};

export default PageBlockWithProvider;
