import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { BlockLoader } from '../../BlockLoader';
import { BlockContext, useBlock } from '../../Provider';
import { Content as IContent } from './context';
import tw from '../../tw';

interface ContentProps {
  content: IContent;
  onUnmount: () => void;
  removed: boolean;
  className?: string;
}

export const ContentRenderer = ({
  content: { blocks = [] },
  className,
  onUnmount,
  removed,
  api,
  events,
}: ContentProps & Pick<BlockContext, 'api' | 'events'>) => {
  const [animationClassName, setAnimationClassName] = useState(
    tw`translate-x-full`
  );

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
      className={`${className} content-stack__content content transition-transform  ${animationClassName}`}
    >
      {blocks.map(({ block, url, ...config }, index) => (
        <div
          key={index}
          className={tw`flex content__block-container block-container snap-start`}
        >
          <BlockLoader
            config={config}
            name={block}
            url={url}
            api={api}
            events={events}
          />
        </div>
      ))}
    </div>
  );
};

export const Content = (props: ContentProps) => {
  const { api, events } = useBlock();

  return useMemo(
    () => <ContentRenderer {...props} api={api} events={events} />,
    [api, events, props]
  );
};

export default Content;
