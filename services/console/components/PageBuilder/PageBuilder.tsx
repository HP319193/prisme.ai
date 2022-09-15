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

interface PageBuilderProps {
  value: PageBuilderContext['page'];
  onChange: (value: Prismeai.Page, events?: string[]) => void;
  blocks: PageBuilderContext['blocks'];
}
export const PageBuilder = ({ value, onChange, blocks }: PageBuilderProps) => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');

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
      const block = await addBlockDetails();
      const newBlocks = [...value.blocks];
      const blockKey = nanoid();
      newBlocks.splice(position, 0, { name: block, key: blockKey });
      onChange({
        ...value,
        blocks: newBlocks,
      });
      setEditBlock(blockKey);
    },
    [addBlockDetails, onChange, setEditBlock, value]
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
      }}
    >
      <div className="relative flex flex-1 overflow-x-hidden h-full">
        <div className="absolute left-10 bottom-10 text-[0.75rem] text-pr-grey z-0">
          {commonT('powered')}
        </div>
        <PageBlocks panelIsOpen={panelIsOpen} />
        <Panel
          title={t('details.title_pages')}
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
