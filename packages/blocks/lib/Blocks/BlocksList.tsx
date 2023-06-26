import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';
import { useMemo } from 'react';

export interface BlocksListConfig extends BaseBlockConfig {
  blocks: ({ slug: string } & Record<string, any>)[];
  blocksClassName?: string;
  tag?: keyof JSX.IntrinsicElements;
}

export const BlocksList = ({
  blocks = [],
  className,
  tag: Tag = 'div',
}: BlocksListConfig) => {
  const {
    utils: { BlockLoader },
  } = useBlocks();

  const memoizedBlocks = useMemo(() => {
    if (!Array.isArray(blocks)) {
      console.error('blocks must be an array');
      return [];
    }
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
    <Tag className={`pr-block-blocks-list ${className ? className : ''}`}>
      {memoizedBlocks}
    </Tag>
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
