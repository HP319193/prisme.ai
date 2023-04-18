import { useBlock } from '../Provider';
import { BaseBlock } from './BaseBlock';
import { BaseBlockConfig } from './types';
import ReactGridLayout, {
  Responsive,
  WidthProvider,
  ResponsiveProps,
} from 'react-grid-layout';
import { useBlocks } from '../Provider/blocksContext';
import { useEffect, useState } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveBlocksGrid = WidthProvider(Responsive);

interface BlockWithLayout {
  block: { slug: string } & Record<string, any>;
  layout: Omit<ReactGridLayout.Layout, 'i'>;
}

export interface BlocksGridConfig extends BaseBlockConfig {
  blocks: BlockWithLayout[];
  blocksClassName?: string;
  globalLayout: ResponsiveProps;
}

export const BlocksGrid = ({
  globalLayout,
  blocks,
  className = '',
}: BlocksGridConfig) => {
  const [layoutState, setLayoutState] = useState<ReactGridLayout.Layout[]>([]);
  const [currentBlocks, setCurrentBlocks] = useState<JSX.Element[]>();

  const {
    utils: { BlockLoader },
  } = useBlocks();

  useEffect(() => {
    const blocksInLayout: BlockWithLayout['block'][] = [];
    const layoutFromConfig: ReactGridLayout.Layout[] = [];

    blocks.forEach(({ block, layout }, key) => {
      blocksInLayout.push(block);
      layoutFromConfig.push({
        i: `${key}-${block.slug}`,
        ...layout,
      });
    });

    const blocksFromConfig = blocksInLayout
      .filter(Boolean)
      .map(({ slug, childClassName = '', ...config }, key) => (
        <div
          key={`${key}-${slug}`}
          className={`pr-blocks-grid__wrapper--${key}`}
        >
          <BlockLoader
            key={`${key}-${slug}`}
            name={slug}
            config={{
              ...config,
              parentClassName: `pr-blocks-grid__block--${key}`,
              className: `pr-blocks-grid__block pr-blocks-grid__block--${key} ${childClassName}`,
            }}
          />
        </div>
      ));

    setCurrentBlocks(blocksFromConfig);
    setLayoutState(layoutFromConfig);
  }, [blocks]);

  return (
    <ResponsiveBlocksGrid
      {...globalLayout}
      breakpoints={{ lg: 1200 }}
      className={`pr-blocks-grid ${className}`}
      layouts={{ lg: layoutState }}
      margin={globalLayout?.margin || [0, 0]}
    >
      {currentBlocks}
    </ResponsiveBlocksGrid>
  );
};

export const BlocksGridInContext = () => {
  const { config } = useBlock<BlocksGridConfig>();
  return (
    <BaseBlock>
      <BlocksGrid {...config} />
    </BaseBlock>
  );
};

export default BlocksGridInContext;
