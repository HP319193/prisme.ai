import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import Panel from '../Panel';
import { context, PageBuilderContext } from './context';
import PageNewBlockForm from './Panel/PageNewBlockForm';
import PageBlocks from './PageBlocks';
import { nanoid } from 'nanoid';
import { useApps } from '../AppsProvider';
import equal from 'fast-deep-equal';
import PageEditBlockForm from './Panel/PageEditBlockForm';
import * as BuiltinBlocks from '../Blocks';
import useBlocksConfigs from '../Blocks/useBlocksConfigs';

interface PageBuilderProps {
  value: PageBuilderContext['page'];
  onChange: (value: Prismeai.Page) => void;
}
export const PageBuilder = ({ value, onChange }: PageBuilderProps) => {
  const { workspace } = useWorkspace();
  const { appInstances } = useApps();
  const [panelIsOpen, setPanelIsOpen] = useState(false);
  const [blockSelecting, setBlockSelecting] = useState<
    | {
        onSubmit: (v: string) => void;
      }
    | undefined
  >();
  const [blockEditing, setBlockEditing] = useState<string>();
  const { events } = useBlocksConfigs(value);

  const hidePanel = useCallback(async () => {
    await setBlockSelecting(undefined);
    await setBlockEditing(undefined);
    await setPanelIsOpen(false);
  }, []);

  const blocks: PageBuilderContext['blocks'] = useMemo(() => {
    return [
      {
        slug: '',
        appName: '',
        blocks: Object.keys(workspace.blocks || {}).map((slug) => ({
          slug,
          ...(workspace.blocks || {})[slug],
        })),
      },
      ...(appInstances.get(workspace.id) || []).map(
        ({ slug = '', appName = '', blocks = [] }) => ({
          slug,
          appName,
          blocks: blocks.map(
            ({ slug, description = slug, name = slug, url = '', edit }) => ({
              slug,
              name,
              description,
              url,
              edit,
            })
          ),
        })
      ),
    ];
  }, [appInstances, workspace.id, workspace.blocks]);

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
      onChange({
        ...value,
        blocks: newBlocks,
      });
    },
    [onChange, value]
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

  const blocksInPage: PageBuilderContext['blocksInPage'] = useMemo(() => {
    return (value.blocks || []).flatMap(({ key, name = '' }) => {
      if (!key) return [];
      const parts = name.split(/\./);
      parts.reverse();
      const [blockName, appName = ''] = parts;
      if (!appName && Object.keys(BuiltinBlocks).includes(blockName)) {
        const Block = BuiltinBlocks[blockName as keyof typeof BuiltinBlocks];
        return {
          url: undefined,
          component: Block,
          name: blockName,
          key,
          appName: '',
          appInstance: undefined,
          edit: Block.schema,
        };
      }
      const app = blocks.find(({ slug }: { slug: string }) => slug === appName);
      if (!app) return [];
      const block = (app.blocks || []).find(
        ({ slug }: { slug: string }) => slug === blockName
      );
      if (!block) return [];
      return { ...block, key, appName: app.appName, appInstance: app.slug };
    });
  }, [value.blocks, blocks]);

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
      }}
    >
      <div className="relative flex flex-1 overflow-x-hidden h-full">
        <PageBlocks />
        <Panel
          visible={panelIsOpen}
          onVisibleChange={hidePanel}
          className="-right-1/2 w-1/2"
        >
          {blockSelecting && <PageNewBlockForm {...blockSelecting} />}
          {blockEditing && <PageEditBlockForm blockId={blockEditing} />}
        </Panel>
      </div>
    </context.Provider>
  );
};

export default PageBuilder;
