import { usePageBuilder } from './context';
import useLocalizedTextConsole from '../../utils/useLocalizedTextConsole';
import AddBlock from './AddBlock';
import EditBlock from './EditBlock';
import { truncate } from '../../utils/strings';
import useBlockConfig from './useBlockConfig';
import api from '../../utils/api';
import { Loading } from '@prisme.ai/design-system';
import { BlockLoader } from '@prisme.ai/blocks'
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
  url,
  workspaceId,
  appInstance,
}: PageBlockProps & {
  hovered: boolean;
  blockId: string;
  index: number;
  name?: Prismeai.LocalizedText;
}) => {
  const { localize } = useLocalizedTextConsole();
  const { setEditBlock, setBlockSchema } = usePageBuilder();
  const onLoad = useCallback(
    (module: any) => {
      if (!module.schema) return;
      setBlockSchema(blockId, module.schema);
    },
    [blockId, setBlockSchema]
  );
  const { config, onConfigUpdate, appConfig, onAppConfigUpdate, events } =
    useBlockConfig({ workspaceId, appInstance, blockId });

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
        <BlockLoader
          // TODO is it really localized, or 'system' name of the component ?
          name={`${name}`}
          url={url}
          config={config}
          onConfigUpdate={onConfigUpdate}
          appConfig={appConfig}
          onAppConfigUpdate={onAppConfigUpdate}
          events={events}
          token={`${api.token}`}
          renderLoading={
            <Loading className="bg-white absolute top-0 right-0 bottom-0 left-0" />
          }
          edit
          onLoad={onLoad}
        />
      </div>

      <div className={`relative ${!hovered ? 'invisible' : ''}`}>
        <AddBlock after={index} />
      </div>
    </div>
  );
};

export default PageBlockWithProvider;
