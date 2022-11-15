import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LayoutContext, useLayout } from './context';
import tw from '../../tw';
import { LeftCircleOutlined } from '@ant-design/icons';
import { useBlocks } from '../../Provider/blocksContext';

interface HeadRendererProps {
  blocks: LayoutContext['head'];
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
        {blocks.map(({ block, ...config }, index) => (
          <BlockLoader key={index} config={config} name={block} />
        ))}
      </div>
    </div>
  );
};

export const Head = () => {
  const { back, history, head } = useLayout();

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
