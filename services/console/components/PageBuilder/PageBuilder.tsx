import React, { useCallback, useMemo, useState } from 'react';
import { builtinBlocks } from '@prisme.ai/blocks';
import Panel from '../Panel';
import { context, PageBuilderContext } from './context';
import PageNewBlockForm from './Panel/PageNewBlockForm';
import PageBlocks from './PageBlocks';
import { nanoid } from 'nanoid';
import equal from 'fast-deep-equal';
import PageEditBlockForm from './Panel/PageEditBlockForm';
import useBlocksConfigs from '../Page/usePageBlocksConfigs';
import { Schema } from '@prisme.ai/design-system';
import { extractEvents } from './extractEvents';
import { useTranslation } from 'next-i18next';
import useBlocks, { BlockInCatalog } from './useBlocks';
import PoweredBy from '../PoweredBy';

interface PageBuilderProps {
  value: PageBuilderContext['page'];
  onChange: (value: Prismeai.Page, events?: string[]) => void;
  blocks: PageBuilderContext['blocks'];
}
export const PageBuilder = ({ value, onChange, blocks }: PageBuilderProps) => {
  const { t } = useTranslation('workspaces');
  const { available, variants } = useBlocks();

  const [panelIsOpen, setPanelIsOpen] = useState(false);
  const [blockSelecting, setBlockSelecting] = useState<
    | {
        onSubmit: (v: string) => void;
      }
    | undefined
  >();
  const [blockEditing, setBlockEditing] = useState<string>();
  const [blocksSchemas, setBlocksSchemas] = useState<Map<string, Schema>>(
    new Map()
  );
  const { events } = useBlocksConfigs(value);

  const hidePanel = useCallback(async () => {
    await setBlockSelecting(undefined);
    await setBlockEditing(undefined);
    await setPanelIsOpen(false);
  }, []);

  // Generate keys
  (value.blocks || []).forEach((block: { key?: string }) => {
    if (block.key) return;
    block.key = nanoid();
  });

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
      const newBlocks = (value.blocks || []).map((block) =>
        key === block.key
          ? {
              ...block,
              config,
            }
          : block
      );
      if (equal(newBlocks, value.blocks)) return;
      const newValue = {
        ...value,
        blocks: newBlocks,
      };

      onChange(
        newValue,
        newBlocks.flatMap(({ config }) => extractEvents(blocksSchemas, config))
      );
    },
    [blocksSchemas, onChange, value]
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
    async (position) => {
      function getOriginalBlock(block: string): BlockInCatalog | null {
        console.log({ block });
        const originalBlock = available.find(({ slug }) => slug === block);
        if (!originalBlock) return null;
        if (originalBlock.block) {
          return getOriginalBlock(originalBlock.block);
        }
        return originalBlock;
      }
      const block = await addBlockDetails();
      const newBlocks = [...value.blocks];
      const blockKey = nanoid();

      const blockDetails = available.find(({ slug }) => slug === block);

      if (!blockDetails) return;

      const originalBlock = getOriginalBlock(block);

      if (!originalBlock) return;

      const newBlock = blockDetails.block
        ? {
            name: originalBlock.slug,
            config: blockDetails.config,
          }
        : {
            name: originalBlock.slug,
          };

      newBlocks.splice(position, 0, { ...newBlock, key: blockKey });
      onChange({
        ...value,
        blocks: newBlocks,
      });
      setEditBlock(blockKey);
    },
    [addBlockDetails, available, onChange, setEditBlock, value]
  );

  const removeBlock: PageBuilderContext['removeBlock'] = useCallback(
    async (key) => {
      const newBlocks = (value.blocks || []).filter(({ key: k }) => k !== key);
      onChange({
        ...value,
        blocks: newBlocks,
      });
      await hidePanel();
    },
    [hidePanel, onChange, value]
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

  const blocksInPage: PageBuilderContext['blocksInPage'] = useMemo(() => {
    return (value.blocks || []).flatMap(({ key, name = '' }) => {
      if (!key) return [];
      const parts = name.split(/\./);
      parts.reverse();
      const [blockName, appName = ''] = parts;
      if (!appName && Object.keys(builtinBlocks).includes(blockName)) {
        return {
          url: undefined,
          slug: name,
          name: blockName,
          key,
          appName: '',
          appInstance: undefined,
        };
      }
      const app = blocks.find(({ slug }: { slug: string }) => slug === appName);
      if (!app) return [];
      const block = (app.blocks || []).find(
        ({ slug }: { slug: string }) => slug === blockName
      );

      if (!block) return [];
      return {
        ...block,
        edit: block.edit || blocksSchemas.get(key),
        key,
        appName: app.appName,
        appInstance: app.slug,
      };
    });
  }, [value.blocks, blocks, blocksSchemas]);

  const { name: editingBlockName } =
    (blockEditing && blocksInPage.find(({ key }) => key === blockEditing)) ||
    {};

  return (
    <context.Provider
      value={{
        page: value,
        blocks,
        blocksInPage,
        addBlock,
        removeBlock,
        setBlockConfig,
        setEditBlock,
        events,
        setBlockSchema,
        catalog: variants,
      }}
    >
      <div className="relative flex flex-1 overflow-x-hidden h-full">
        <PoweredBy />
        <PageBlocks />
        <Panel
          title={t('pages.blocks.panelTitle', {
            context: blockSelecting ? 'adding' : 'editing',
            block: editingBlockName,
            blockName: t('pages.blocks.name', { context: editingBlockName }),
          })}
          visible={panelIsOpen}
          onVisibleChange={hidePanel}
        >
          {blockSelecting && <PageNewBlockForm {...blockSelecting} />}
          {blockEditing && <PageEditBlockForm blockId={blockEditing} />}
        </Panel>
      </div>
    </context.Provider>
  );
};

export default PageBuilder;
