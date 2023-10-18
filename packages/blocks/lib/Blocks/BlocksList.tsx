import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';
import { useMemo } from 'react';

export interface BlocksListConfig extends BaseBlockConfig {
  blocks: ({ slug: string } & Record<string, any>)[];
  blocksClassName?: string;
  tag?: keyof JSX.IntrinsicElements | 'fragment';
  fragment?: boolean;
}

export const BlocksList = ({
  blocks = [],
  className,
  tag = 'div',
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
          key={`${key}-${slug}-${Math.random()}`}
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

  if (tag === 'fragment') {
    return <>{memoizedBlocks}</>;
  }

  const Tag = tag || 'div';

  if (typeof Tag === 'object' && Object.keys(Tag).length === 0) return null;

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
