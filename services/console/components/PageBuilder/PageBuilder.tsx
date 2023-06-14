import React, { useCallback, useEffect, useRef, useState } from 'react';
import Panel from '../Panel';
import { context, PageBuilderContext, BlocksWithKeys } from './context';
import PageNewBlockForm from './Panel/PageNewBlockForm';
import PageBlocks from './PageBlocks';
import { nanoid } from 'nanoid';
import equal from 'fast-deep-equal';
import PageEditBlockForm from './Panel/PageEditBlockForm';
import { useTranslation } from 'next-i18next';
import useBlocks, { BlockInCatalog } from './useBlocks';
import EmptyPage from './EmptyPage';
import { useTracking } from '../Tracking';

interface PageBuilderProps {
  value: Prismeai.Page['blocks'];
  onChange: (value: Prismeai.Page['blocks'], events?: string[]) => void;
}

function addKeyToBlocks(
  value: PageBuilderProps['value'],
  prevValue: BlocksWithKeys = new Map()
): BlocksWithKeys {
  if (!value) return prevValue;
  return new Map(
    value.flatMap((block) => {
      if (!block) return [];
      const [key = nanoid()] =
        Array.from(prevValue.entries()).find(([k, v]) => v === block) || [];
      return [[key, block]];
    })
  );
}

export const PageBuilder = ({ value, onChange }: PageBuilderProps) => {
  const { t } = useTranslation('workspaces');
  const { trackEvent } = useTracking();

  const [blocks, _setBlocks] = useState<BlocksWithKeys>(addKeyToBlocks(value));

  const dontReloadValue = useRef(false);
  const setBlocks = useCallback(
    (blocks: BlocksWithKeys) => {
      _setBlocks(blocks);
      dontReloadValue.current = true;
      onChange(Array.from(blocks.values()));
    },
    [onChange]
  );
  const { available, variants } = useBlocks();

  useEffect(() => {
    if (dontReloadValue.current) {
      dontReloadValue.current = false;
      return;
    }
    _setBlocks(addKeyToBlocks(value));
  }, [value]);

  const [panelIsOpen, setPanelIsOpen] = useState(false);
  const [blockSelecting, setBlockSelecting] = useState<
    | {
        onSubmit: (v: string) => void;
      }
    | undefined
  >();
  const [blockEditing, setBlockEditing] = useState<string>();
  const [blockEditingOnBack, setBlockEditingOnBack] = useState<() => void>();
  const [blocksSchemas, setBlocksSchemas] = useState<
    PageBuilderContext['blocksSchemas']
  >(new Map());

  const hidePanel = useCallback(async () => {
    setBlockEditingOnBack(undefined);
    await setBlockSelecting(undefined);
    await setBlockEditing(undefined);
    await setPanelIsOpen(false);
  }, []);

  const setEditBlock = useCallback(
    async (blockId: string) => {
      await hidePanel();
      setBlockEditing(blockId);
      setPanelIsOpen(true);
    },
    [hidePanel]
  );

  const setBlockConfig: PageBuilderContext['setBlockConfig'] = useCallback(
    (key, config) => {
      const prevBlock = blocks.get(key);
      if (!prevBlock) return;

      const { config: oldSchoolConfig, ...prevBlockData } = prevBlock;
      let newBlock = {
        ...prevBlockData,
        ...config,
      };

      // TODO : remove this debt by migrate all pages
      if (['Popover.Popover', 'Charts Block.charts'].includes(prevBlock.slug)) {
        newBlock = {
          ...prevBlock,
          config,
        };
      }
      //\TODO

      if (equal(newBlock, prevBlock)) return;
      const newBlocks = new Map(blocks);
      newBlocks.set(key, newBlock);
      setBlocks(newBlocks);
    },
    [blocks, setBlocks]
  );

  const addBlockDetails = useCallback(async () => {
    return new Promise<string>(async (resolve) => {
      await hidePanel();
      setBlockSelecting({
        onSubmit: (blockSlug: string) => {
          resolve(blockSlug);
        },
      });
      setPanelIsOpen(true);
    });
  }, [hidePanel]);

  const addBlock: PageBuilderContext['addBlock'] = useCallback(
    async (position, blockName) => {
      function getOriginalBlock(block: string): BlockInCatalog | null {
        const originalBlock = available.find(({ slug }) => slug === block);
        if (!originalBlock) return null;
        if (originalBlock.block) {
          return getOriginalBlock(originalBlock.block);
        }
        return originalBlock;
      }
      const slug = blockName || (await addBlockDetails());
      const newBlocks = Array.from(blocks.entries());
      const blockKey = nanoid();

      const blockDetails = available.find(({ slug: s }) => s === slug);

      if (!blockDetails) return;

      const originalBlock = getOriginalBlock(slug);

      if (!originalBlock) return;

      const newBlock = blockDetails.block
        ? {
            slug: originalBlock.slug,
            config: blockDetails.config,
          }
        : {
            slug: originalBlock.slug,
          };

      newBlocks.splice(position, 0, [blockKey, newBlock]);

      setBlocks(new Map(newBlocks));
      setEditBlock(blockKey);
      setBlockEditingOnBack(() => () => {
        setBlocks(
          new Map(
            Array.from(blocks.entries()).filter(([key]) => key !== blockKey)
          )
        );
        setBlockEditing(undefined);
        addBlock(position);
        setBlockEditingOnBack(undefined);
      });
    },
    [addBlockDetails, available, blocks, setBlocks, setEditBlock]
  );

  const removeBlock: PageBuilderContext['removeBlock'] = useCallback(
    async (key) => {
      const newBlocks = new Map(blocks);
      newBlocks.delete(key);
      setBlocks(newBlocks);
      await hidePanel();
    },
    [blocks, hidePanel, setBlocks]
  );

  const setBlockSchema: PageBuilderContext['setBlockSchema'] = useCallback(
    (blockId, schema) => {
      setBlocksSchemas((schemas) => {
        const newSchemas = new Map(schemas);
        newSchemas.set(blockId, schema);
        return newSchemas;
      });
    },
    []
  );

  const { slug: editingBlockName } =
    (blockEditing && blocks.get(blockEditing)) || {};

  const onAddBlock = useCallback(
    (blockName?: string) => {
      if (!blockName) {
        return addBlock(0);
      }
      return addBlock(0, blockName);
    },
    [addBlock]
  );

  return (
    <context.Provider
      value={{
        value: blocks,
        addBlock,
        removeBlock,
        setBlockConfig,
        setEditBlock,
        setBlockSchema,
        catalog: variants,
        blocksSchemas,
      }}
    >
      <div className="relative flex flex-1 overflow-x-hidden h-full">
        {blocks.size === 0 && <EmptyPage onAddBlock={onAddBlock} />}
        {blocks.size > 0 && <PageBlocks />}
        <Panel
          title={t('pages.blocks.panelTitle', {
            context: blockSelecting ? 'adding' : 'editing',
            block: editingBlockName,
            blockName: t('pages.blocks.name', { context: editingBlockName }),
          })}
          visible={panelIsOpen && !!(blockSelecting || editingBlockName)}
          onVisibleChange={hidePanel}
          onBack={blockEditingOnBack}
        >
          {blockSelecting && <PageNewBlockForm {...blockSelecting} />}
          {editingBlockName && blockEditing && (
            <PageEditBlockForm blockId={blockEditing} />
          )}
        </Panel>
      </div>
    </context.Provider>
  );
};

export default PageBuilder;
