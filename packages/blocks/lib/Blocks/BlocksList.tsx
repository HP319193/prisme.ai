import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';

export interface BlocksListConfig extends BaseBlockConfig {
  blocks: ({ slug: string } & Record<string, any>)[];
  blocksClassName?: string;
}

export const BlocksList = ({
  blocks = [],
  className,
  blocksClassName,
}: BlocksListConfig) => {
  const {
    utils: { BlockLoader },
  } = useBlocks();

  if (!Array.isArray(blocks)) return null;

  return (
    <div className={`pr-block-blocks-list ${className ? className : ''}`}>
      {blocks.filter(Boolean).map(({ slug, ...config }, key) => (
        <div
          key={key}
          className={`pr-block-blocks-list__block pr-block-blocks-list__block--${key} ${
            blocksClassName ? blocksClassName : ''
          }`}
        >
          <BlockLoader
            name={slug}
            config={{
              ...config,
              parentClassName: `pr-block-blocks-list__block--${key}`,
            }}
          />
        </div>
      ))}
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
