import React, { useCallback, useEffect, useRef, useState } from 'react';
import Panel from '../Panel';
import { BlockWithKey, context, PageBuilderContext } from './context';
import PageNewBlockForm from './Panel/PageNewBlockForm';
import PageBlocks from './PageBlocks';
import { nanoid } from 'nanoid';
import equal from 'fast-deep-equal';
import PageEditBlockForm from './Panel/PageEditBlockForm';
import { useTranslation } from 'next-i18next';
import useBlocks, { BlockInCatalog } from './useBlocks';
import EmptyPage from './EmptyPage';

interface PageBuilderProps {
  value: Prismeai.Page['blocks'];
  onChange: (value: Prismeai.Page['blocks'], events?: string[]) => void;
}

export const PageBuilder = ({ value, onChange }: PageBuilderProps) => {
  const { t } = useTranslation('workspaces');

  const [blocks, setBlocks] = useState<BlockWithKey[]>(
    value
      ? value.map((block) => ({
          ...block,
          key: nanoid(),
        }))
      : []
  );
  const { available, variants } = useBlocks();

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

  const onChangeRef = useRef<any>(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onChangeRef.current(blocks.map(({ key, ...block }) => block));
  }, [blocks]);

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
      const newBlocks = (blocks || []).map((block) =>
        key === block.key
          ? {
              ...block,
              config,
            }
          : block
      );
      if (equal(newBlocks, blocks)) return;

      setBlocks(newBlocks);
    },
    [blocks]
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
      const newBlocks = [...blocks];
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

      newBlocks.splice(position, 0, { ...newBlock, key: blockKey });
      setBlocks(newBlocks);
      setEditBlock(blockKey);
      setBlockEditingOnBack(() => () => {
        setBlocks(blocks.filter(({ key }) => key !== blockKey));
        setBlockEditing(undefined);
        addBlock(position);
        setBlockEditingOnBack(undefined);
      });
    },
    [addBlockDetails, available, blocks, setEditBlock]
  );

  const removeBlock: PageBuilderContext['removeBlock'] = useCallback(
    async (key) => {
      const newBlocks = (blocks || []).filter(({ key: k }) => k !== key);
      setBlocks(newBlocks);
      await hidePanel();
    },
    [blocks, hidePanel]
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
    (blockEditing && blocks.find(({ key }) => key === blockEditing)) || {};

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
        {blocks.length === 0 && <EmptyPage onAddBlock={onAddBlock} />}
        {blocks.length > 0 && <PageBlocks />}
        <Panel
          title={t('pages.blocks.panelTitle', {
            context: blockSelecting ? 'adding' : 'editing',
            block: editingBlockName,
            blockName: t('pages.blocks.name', { context: editingBlockName }),
          })}
          visible={panelIsOpen}
          onVisibleChange={hidePanel}
          onBack={blockEditingOnBack}
        >
          {blockSelecting && <PageNewBlockForm {...blockSelecting} />}
          {blockEditing && <PageEditBlockForm blockId={blockEditing} />}
        </Panel>
      </div>
    </context.Provider>
  );
};

export default PageBuilder;
