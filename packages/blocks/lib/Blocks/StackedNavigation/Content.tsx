import { useLayoutEffect, useRef, useState } from 'react';
import { Content as IContent } from './context';
import tw from '../../tw';
import { BlocksList } from '../BlocksList';
import { useBlocks } from '../../Provider/blocksContext';

interface ContentProps {
  content: IContent;
  onUnmount: () => void;
  removed: boolean;
  className?: string;
}

export const Content = ({
  content: { blocks },
  className,
  onUnmount,
  removed,
}: ContentProps) => {
  const {
    utils: { BlockLoader },
  } = useBlocks();
  const [animationClassName, setAnimationClassName] = useState(
    tw`translate-x-full`
  );
  const containerEl = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setTimeout(() => setAnimationClassName(''));
  }, []);

  useLayoutEffect(() => {
    if (!removed) return;
    setTimeout(() => setAnimationClassName(tw`translate-x-full`));
    setTimeout(onUnmount, 200);
  }, [removed]);

  const legacyBlocks = blocks.map(({ block, slug, ...rest }) => ({
    slug: slug || block || '',
    ...rest,
  }));

  return (
    <div
      ref={containerEl}
      className={tw`${className} flex content-stack__content content transition-transform  ${animationClassName}`}
    >
      {blocks && (
        <BlockLoader
          name="BlocksList"
          config={{
            blocks: legacyBlocks,
            className: 'flex flex-1 flex-col max-w-full overflow-auto',
            blocksClassName: tw`flex flex-1 content__block-container block-container snap-start max-h-full`,
          }}
        />
      )}
    </div>
  );
};
export default Content;
