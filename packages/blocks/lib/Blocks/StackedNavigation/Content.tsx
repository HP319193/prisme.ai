import { useLayoutEffect, useRef, useState } from 'react';
import { Content as IContent } from './context';
import tw from '../../tw';
import { BlocksList } from '../BlocksList';

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
      className={tw`${className} content-stack__content content transition-transform  ${animationClassName}`}
    >
      {blocks && (
        <BlocksList
          blocks={legacyBlocks}
          className={tw`flex content__block-container block-container snap-start`}
        />
      )}
    </div>
  );
};
export default Content;
