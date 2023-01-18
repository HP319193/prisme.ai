import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';

export interface BlocksListConfig {
  blocks: ({ slug: string } & Record<string, any>)[];
  styles?: Record<string, string>;
  className?: string;
  blocksClassName?: string;
}

export const BlocksList = ({
  blocks = [],
  styles,
  className,
}: BlocksListConfig) => {
  const {
    utils: { BlockLoader },
  } = useBlocks();

  if (!Array.isArray(blocks)) return null;

  return (
    <div style={styles} className="pr-block-blocks-list">
      {blocks.map(({ slug, ...config }, key) => (
        <div key={key} className={className}>
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
