import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BlockContext, useBlock } from '../../Provider';
import { Content as IContent } from './context';
import tw from '../../tw';
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

  return (
    <div
      ref={containerEl}
      className={tw`${className} content-stack__content content transition-transform  ${animationClassName}`}
    >
      {blocks &&
        blocks.map(({ block, url, onInit, ...config }, index) => (
          <div
            key={index}
            className={tw`flex content__block-container block-container snap-start`}
          >
            <BlockLoader
              config={config}
              name={block}
              container={containerEl.current || undefined}
            />
          </div>
        ))}
    </div>
  );
};
export default Content;
