import { useMemo, useRef, useState } from 'react';
import useLocalizedText from '../../utils/useLocalizedText';
import { usePageBuilder } from './context';
import PageBlock from './PageBlock';
import debounce from 'lodash/debounce';
import AddBlock from './AddBlock';
import { useWorkspace } from '../WorkspaceProvider';

export const PageBlocks = ({ panelIsOpen }: { panelIsOpen: boolean }) => {
  const { localize } = useLocalizedText();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { blocksInPage } = usePageBuilder();
  const [hoveredKey, setHoveredKey] = useState<string | undefined>();
  const containerEl = useRef<HTMLDivElement>(null);

  const debouncedOnMouseLeave = useMemo(
    () =>
      debounce(() => {
        setHoveredKey(undefined);
      }, 500),
    []
  );

  return (
    <div
      className={`page-blocks flex grow flex-col transition-all items-center overflow-y-auto h-full snap-mandatory z-10`}
    >
      <div className="snap-start" />
      <div
        ref={containerEl}
        className={`flex flex-1 flex-col w-[768px] transition-transform ease-in-out duration-200 m-8 ${
          panelIsOpen ? '-translate-x-[10rem]' : ''
        }`}
      >
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
              container={containerEl.current || undefined}
            />
          </div>
        ))}
      </div>
      <div className="snap-start" />
    </div>
  );
};
export default PageBlocks;
