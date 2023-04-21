import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';
import { useMemo, useState } from 'react';
import { useResizable } from 'react-resizable-layout';
import './SampleSplitter.css';
import tw from '../tw';

export interface BlocksSplitConfig extends BaseBlockConfig {
  firstBlock: { slug: string } & Record<string, any>;
  secondBlock: { slug: string } & Record<string, any>;
  axis: 'x' | 'y';
  initial: number;
  min: number;
  blocksClassName?: string;
}

const SampleSplitter = ({
  id = 'drag-bar',
  dir,
  isDragging,
  ...props
}: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      id={id}
      data-testid={id}
      tabIndex={0}
      className={`sample-drag-bar ${
        dir === 'horizontal' ? 'sample-drag-bar--horizontal' : ''
      } ${isDragging || isFocused ? 'sample-drag-bar--dragging' : ''}}}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...props}
    />
  );
};

export const BlocksSplit = ({
  firstBlock,
  secondBlock,
  axis = 'x',
  initial = 250,
  min = 50,
  className,
}: BlocksSplitConfig) => {
  const {
    utils: { BlockLoader },
  } = useBlocks();

  const { position, separatorProps } = useResizable({
    axis,
    initial,
    min,
  });

  const memoizedBlocks = useMemo(() => {
    return [firstBlock, secondBlock]
      .filter(Boolean)
      .map(({ slug, className = '', ...config }, key) => (
        <BlockLoader
          key={`${key}-${slug}`}
          name={slug}
          config={{
            ...config,
            parentClassName: `pr-block-blocks-split__block--${key}`,
            className: `pr-block-blocks-split__block pr-block-blocks-split__block--${key} ${className}`,
          }}
        />
      ));
  }, [firstBlock, secondBlock]);

  if (!Array.isArray(memoizedBlocks)) return null;

  console.log('memoizedBlocks', memoizedBlocks);

  if (memoizedBlocks.length !== 2)
    return (
      <div
        className={tw`pr-block-blocks-split pr-block-blocks-split__error ${
          className ? className : ''
        }`}
      >
        <div className={`error error__content text-red`}>
          Blocks-split should receive exactly 2 blocks
        </div>
      </div>
    );

  return (
    <div
      className={tw`pr-block-blocks-split flex flex-row ${
        className ? className : ''
      }`}
    >
      <div
        className="pr-block-blocks-split__wrapper wrapper-0 overflow-hidden"
        style={{ width: position }}
      >
        {memoizedBlocks[0]}
      </div>
      <SampleSplitter {...separatorProps} />
      <div className="pr-block-blocks-split__wrapper wrapper-0 overflow-hidden">
        {memoizedBlocks[1]}
      </div>
    </div>
  );
};

export const BlocksSplitInContext = () => {
  const { config } = useBlock<BlocksSplitConfig>();
  return (
    <BaseBlock>
      <BlocksSplit {...config} />
    </BaseBlock>
  );
};

export default BlocksSplitInContext;
