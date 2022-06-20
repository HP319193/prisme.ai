import { useMemo, useState } from 'react';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import useLocalizedText from '../../utils/useLocalizedText';
import { usePageBuilder } from './context';
import PageBlock from './PageBlock';
import debounce from 'lodash/debounce';
import AddBlock from './AddBlock';

export const PageBlocks = () => {
  const { localize } = useLocalizedText();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { blocksInPage } = usePageBuilder();
  const [hoveredKey, setHoveredKey] = useState<string | undefined>();

  const debouncedOnMouseLeave = useMemo(
    () =>
      debounce(() => {
        setHoveredKey(undefined);
      }, 500),
    []
  );

  return (
    <div className="page-blocks flex grow flex-col items-center overflow-y-auto h-full snap-y snap-mandatory">
      <div className="flex flex-1 flex-col w-[768px] py-8">
        {blocksInPage.length === 0 && (
          <div className="relative">
            <AddBlock after={-1} centered />
          </div>
        )}
        {blocksInPage.map(({ url, key, name, appName, appInstance }, index) => (
          <div
            key={key}
            onMouseEnter={() => {
              setHoveredKey(key);
              debouncedOnMouseLeave.cancel();
            }}
            onMouseLeave={debouncedOnMouseLeave}
            className="flex basis-14 snap-start"
          >
            <PageBlock
              url={url}
              id={`${key || index}`}
              title={
                <div className="flex flex-row">
                  <strong className="mr-2">{localize(appName)}</strong>{' '}
                  {localize(name)}
                </div>
              }
              workspaceId={workspaceId}
              appInstance={appInstance}
              hovered={hoveredKey === key}
              blockId={key}
              index={index}
              name={name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default PageBlocks;
