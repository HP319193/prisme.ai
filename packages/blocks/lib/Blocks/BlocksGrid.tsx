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
  const [lastLayoutStateCorrectHeight, setLastLayoutStateCorrectHeight] =
    useState<ReactGridLayout.Layout[]>();
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

  // This is to handle maxRows
  // see https://github.com/react-grid-layout/react-grid-layout/issues/1104
  const onLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
    setLayoutState(newLayout);
    resetOldLayoutIfNewHeightTooBig(newLayout);
  };

  // This is to handle maxRows
  const resetOldLayoutIfNewHeightTooBig = (
    newLayout: ReactGridLayout.Layout[]
  ) => {
    if (
      !globalLayout ||
      !globalLayout.maxRows ||
      !lastLayoutStateCorrectHeight
    ) {
      return;
    }

    const maxRows = globalLayout.maxRows;

    let updatedLayout: ReactGridLayout.Layout[] = [...newLayout];

    if (maxRows !== 1) return;

    const updatedBlockIndex = newLayout.findIndex(
      (block, index) => layoutState[index].w !== block.w
    );

    if (updatedBlockIndex !== -1) {
      const adjustedLayout = [...newLayout];
      let nextIndex;
      if (updatedBlockIndex < adjustedLayout.length - 1) {
        nextIndex = updatedBlockIndex + 1;
      } else {
        nextIndex = updatedBlockIndex - 1;
      }
      const nextBlock = { ...adjustedLayout[nextIndex] };

      const changedCurrentW =
        adjustedLayout[updatedBlockIndex].w - layoutState[updatedBlockIndex].w;
      const nextBlockNewW = nextBlock.w - changedCurrentW;

      if (
        nextBlockNewW > 0 &&
        (!nextBlock.minW || nextBlockNewW > nextBlock.minW)
      ) {
        nextBlock.w = nextBlockNewW;
        adjustedLayout[nextIndex] = { ...nextBlock };
        updatedLayout = [...adjustedLayout];
      }
    }

    const isTooBig = updatedLayout.some(
      (block: ReactGridLayout.Layout) => block.y >= maxRows
    );

    if (isTooBig) {
      setLayoutState(lastLayoutStateCorrectHeight);
    } else {
      setLayoutState(updatedLayout);
    }
  };

  // This is to handle maxRows
  const saveCurrentLayouts = () => {
    if (!layoutState) return;
    setLastLayoutStateCorrectHeight([...layoutState]);
  };

  return (
    <ResponsiveBlocksGrid
      {...globalLayout}
      breakpoints={{ lg: 1200 }}
      className={`pr-blocks-grid ${className}`}
      layouts={{ lg: layoutState }}
      onDragStart={saveCurrentLayouts}
      onResizeStart={saveCurrentLayouts}
      onLayoutChange={onLayoutChange}
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
