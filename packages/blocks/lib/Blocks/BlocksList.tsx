import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';
import { useMemo, useRef } from 'react';
import equal from 'fast-deep-equal';

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
  const prevBlocks = useRef<
    {
      key: string;
      block: BlocksListConfig['blocks'][number];
    }[]
  >([]);

  const memoizedBlocks = useMemo(() => {
    if (!Array.isArray(blocks)) {
      console.error('blocks must be an array');
      return [];
    }

    prevBlocks.current = blocks.filter(Boolean).map((block, index) => {
      const previousBlock = prevBlocks.current[index];
      if (previousBlock && equal(previousBlock.block, block)) {
        return previousBlock;
      }
      return {
        key: `${block.key}-${block.slug}-${Math.random()}`,
        block,
      };
    });

    return prevBlocks.current.map(
      ({ key, block: { slug, className = '', ...config } }, index) => (
        <BlockLoader
          key={key}
          name={slug}
          config={{
            ...config,
            parentClassName: `pr-block-blocks-list__block--${index}`,
            className: `pr-block-blocks-list__block pr-block-blocks-list__block--${key} ${className}`,
          }}
        />
      )
    );
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
