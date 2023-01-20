import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';

export interface BlocksListConfig {
  blocks: ({ slug: string } & Record<string, any>)[];
  className?: string;
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
      {blocks.map(({ slug, ...config }, key) => (
        <div
          key={key}
          className={`pr-block-blocks-list__block ${
            blocksClassName ? blocksClassName : ''
          }`}
        >
          <BlockLoader name={slug} config={config} />
        </div>
      ))}
    </div>
  );
};

export const BlocksListInContext = () => {
  const { config } = useBlock<BlocksListConfig>();

  return <BlocksList {...config} />;
};

export default BlocksListInContext;
