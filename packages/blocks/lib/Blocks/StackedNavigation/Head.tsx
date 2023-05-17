import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { StackedNavigationContext, useStackedNavigation } from './context';
import tw from '../../tw';
import { LeftCircleOutlined } from '@ant-design/icons';
import { BlocksList } from '../BlocksList';
import { useBlocks } from '../../Provider/blocksContext';

interface HeadRendererProps {
  blocks: StackedNavigationContext['head'];
  onBack: () => void;
  hasHistory: boolean;
}
export const HeadRenderer = ({
  blocks,
  onBack,
  hasHistory,
}: HeadRendererProps) => {
  const {
    utils: { BlockLoader },
  } = useBlocks();
  const buttonEl = useRef<HTMLButtonElement>(null);
  const [animationClassName, setAnimationClassName] = useState('');

  const margin = buttonEl.current
    ? buttonEl.current.getBoundingClientRect().width * 2
    : 0;
  useLayoutEffect(() => {
    if (hasHistory) {
      setAnimationClassName('');
    } else {
      setAnimationClassName(tw`-translate-x-[${margin}px]`);
    }
  }, [hasHistory, margin]);

  const legacyBlocks = blocks.map(({ block, slug, ...rest }) => ({
    slug: slug || block || '',
    ...rest,
  }));

  return (
    <div className={tw`flex flex-1 bg-white transition-transform`}>
      <div
        className={`flex flex-row flex-1 transition-transform ${animationClassName}`}
        style={{ marginRight: `-${margin}px` }}
      >
        <button
          onClick={onBack}
          className={tw`head__button-back button-back ml-2`}
          ref={buttonEl}
        >
          <LeftCircleOutlined />
        </button>
        {blocks && (
          <BlockLoader
            name="BlocksList"
            config={{ blocks: legacyBlocks, className: 'flex-1' }}
          />
        )}
      </div>
    </div>
  );
};

export const Head = () => {
  const { back, history, head } = useStackedNavigation();

  return useMemo(
    () => (
      <HeadRenderer
        onBack={back}
        hasHistory={history.length > 1}
        blocks={head}
      />
    ),
    [back, history, head]
  );
};

export default Head;
