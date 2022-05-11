import api from '../../utils/api';
import { usePageBuilder } from './context';
import { Loading } from '@prisme.ai/design-system';
import Block from '../Block';
import useLocalizedText from '../../utils/useLocalizedText';
import AddBlock from './AddBlock';
import EditBlock from './EditBlock';
import { truncate } from '../../utils/strings';
import PageBlockProvider from './PageBlockProvider';

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
  const { setEditBlock } = usePageBuilder();

  return (
    <div className="flex grow flex-col max-w-full">
      <div className={`relative ${!hovered ? 'invisible' : ''}`}>
        <AddBlock after={index - 1} />
        <EditBlock onEdit={() => setEditBlock(blockId)} />
        <div className="absolute left-[-120px] top-[-10px] z-20 text-right w-[90px] text-gray">
          {truncate(localize(name), 10)}
        </div>
      </div>

      <PageBlockProvider blockId={id}>
        <div className="flex grow  relative flex-col surface-section border-slate-100 bg-white  border overflow-hidden z-2">
          {Component && <Component edit />}
          {url && (
            <Block
              url={url}
              entityId={id}
              token={`${api.token}`}
              workspaceId={workspaceId}
              appInstance={appInstance}
              renderLoading={
                <Loading className="bg-white absolute top-0 right-0 bottom-0 left-0" />
              }
              edit
            />
          )}
        </div>
      </PageBlockProvider>

      <div className={`relative ${!hovered ? 'invisible' : ''}`}>
        <AddBlock after={index} />
      </div>
    </div>
  );
};

export default PageBlockWithProvider;
