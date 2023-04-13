import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';
import { useMemo } from 'react';

export interface BlocksListConfig extends BaseBlockConfig {
  blocks: ({ slug: string } & Record<string, any>)[];
  blocksClassName?: string;
}

export const BlocksList = ({ blocks = [], className }: BlocksListConfig) => {
  const {
    utils: { BlockLoader },
  } = useBlocks();

  const memoizedBlocks = useMemo(() => {
    return blocks
      .filter(Boolean)
      .map(({ slug, className = '', ...config }, key) => (
        <BlockLoader
          key={`${key}-${slug}`}
          name={slug}
          config={{
            ...config,
            parentClassName: `pr-block-blocks-list__block--${key}`,
            className: `pr-block-blocks-list__block pr-block-blocks-list__block--${key} ${className}`,
          }}
        />
      ));
  }, [blocks]);

  if (!Array.isArray(blocks)) return null;

  return (
    <div className={`pr-block-blocks-list ${className ? className : ''}`}>
      {memoizedBlocks}
    </div>
  );
};

export const BlocksListInContext = () => {
  const { config } = useBlock<BlocksListConfig>();
  return (
    <BaseBlock>
      <BlocksList {...config} />
    </BaseBlock>
  );
};

export default BlocksListInContext;
