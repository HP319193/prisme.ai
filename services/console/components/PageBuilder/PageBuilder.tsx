import { useCallback, useMemo, useState } from 'react';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import Panel from '../Panel';
import { context, PageBuilderContext } from './context';
import PageBlockForm from './Panel/PageBlockForm';
import PageBlocks from './PageBlocks';
import { nanoid } from 'nanoid';
import { useApps } from '../AppsProvider';
import equal from 'fast-deep-equal';

interface PageBuilderProps {
  value: PageBuilderContext['page'];
  onChange: (value: Prismeai.Page) => void;
}
export const PageBuilder = ({ value, onChange }: PageBuilderProps) => {
  const { workspace } = useWorkspace();
  const { appInstances } = useApps();
  const [panelIsOpen, setPanelIsOpen] = useState(false);
  const [blockEditing, setBlockEditing] = useState<
    | {
        onSubmit: (v: string) => void;
      }
    | undefined
  >();
  const hidePanel = useCallback(() => {
    setBlockEditing(undefined);
    setPanelIsOpen(false);
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

  const addBlockDetails = useCallback(async () => {
    return new Promise<string>((resolve) => {
      hidePanel();
      setBlockEditing({
        onSubmit: (blockSlug: string) => {
          resolve(blockSlug);
          hidePanel();
        },
      });
      setPanelIsOpen(true);
    });
  }, [hidePanel]);
  const addBlock: PageBuilderContext['addBlock'] = useCallback(
    async (position) => {
      const block = await addBlockDetails();
      const newBlocks = [...value.blocks];
      newBlocks.splice(position, 0, { name: block, key: nanoid() });
      onChange({
        ...value,
        blocks: newBlocks,
      });
    },
    [addBlockDetails, onChange, value]
  );

  const removeBlock: PageBuilderContext['removeBlock'] = useCallback(
    (key) => {
      const newBlocks = (value.blocks || []).filter(({ key: k }) => k !== key);
      onChange({
        ...value,
        blocks: newBlocks,
      });
    },
    [onChange, value]
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

  return (
    <context.Provider
      value={{ page: value, blocks, addBlock, removeBlock, setBlockConfig }}
    >
      <div className="relative flex flex-1 overflow-x-hidden">
        <PageBlocks />
        <Panel visible={panelIsOpen} onVisibleChange={hidePanel}>
          {blockEditing && <PageBlockForm {...blockEditing} />}
        </Panel>
      </div>
    </context.Provider>
  );
};

export default PageBuilder;
