import { Schema } from '@prisme.ai/design-system';
import { createContext, ReactNode, useCallback, useMemo } from 'react';
import { useContext } from '../../utils/useContext';
import useLocalizedText from '../../utils/useLocalizedText';
import getEditSchema from '../../components/PageBuilder/Panel/EditSchema/getEditSchema';
import { BlockComponent, builtinBlocks, loadModule } from '@prisme.ai/blocks';
import { extendsSchema } from '../../components/BlocksListEditor/extendsSchema';
import { useTranslation } from 'next-i18next';
import { useWorkspace } from '../Workspace';
import { BlockInCatalog } from './types';
import { builtInBlocksOrder } from './config';
import builtinBlocksVariants from './builtinBlocksVariants';
import workspaceIcon from '../../icons/icon-workspace.svg';

interface WorkspaceBlocksContext {
  getSchema: (slug: string, path?: string) => Promise<Schema | undefined>;
  blocks: BlockInCatalog[];
  variants: BlockInCatalog[];
}

export const workspaceBlocksContext = createContext<
  WorkspaceBlocksContext | undefined
>(undefined);
export const useWorkspaceBlocks = () => useContext(workspaceBlocksContext);

interface BlocksProviderProps {
  children: ReactNode;
}
const CACHE = new Map<string, Schema | null>();
export const BlocksProvider = ({ children }: BlocksProviderProps) => {
  const { localizeSchemaForm } = useLocalizedText();
  const { t } = useTranslation('workspaces');
  const { workspace: { name, blocks: workspaceBlocks, photo, imports } = {} } =
    useWorkspace();

  const blocks: BlockInCatalog[] = useMemo(() => {
    const blocks: BlockInCatalog[] = [
      ...Object.keys(builtinBlocks)
        .sort((a, b) => {
          const indexA = builtInBlocksOrder.indexOf(a);
          const indexB = builtInBlocksOrder.indexOf(b);
          return (
            (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
          );
        })
        .map((key) => ({
          builtIn: true,
          slug: key,
          name: t('pages.blocks.name', { context: key }),
          description: t('pages.blocks.description', { context: key }),
          photo: `/images/blocks/preview-${key}.png`,
        })),
      // Builtin variants
      ...builtinBlocksVariants.map((variant) => ({
        builtIn: true,
        ...variant,
      })),
      ...(workspaceBlocks
        ? Object.entries(workspaceBlocks).map(([key, block]) => ({
            ...block,
            name: block.name || key,
            from: name,
            slug: key,
            icon: photo || workspaceIcon.src,
          }))
        : []),
      // Apps blocks
      ...Object.entries(imports || {}).reduce<BlockInCatalog[]>(
        (prev, [, { appName = '', blocks, photo }]) => {
          if (!blocks || blocks.length === 0) return prev;

          return [
            ...prev,
            ...blocks.map((block) => ({
              ...block,
              from: appName,
              slug: block.slug,
              name: block.name || block.slug,
              icon: photo,
            })),
          ];
        },
        []
      ),
    ];
    return blocks.filter(({ slug, block }, k, all) => {
      return (
        !all.slice(0, k).find(({ slug: s }) => s === slug) &&
        (!block || all.find(({ slug }) => block === slug))
      );
    });
  }, [imports, name, photo, t, workspaceBlocks]);

  const variants = useMemo(() => {
    const roots: BlockInCatalog[] = [];
    const children: BlockInCatalog[] = [];

    blocks.forEach((block) => {
      if (block.block) {
        children.push({ ...block });
      } else {
        roots.push({ ...block });
      }
    });

    function getParent(block: BlockInCatalog): BlockInCatalog | undefined {
      const parent = roots.find(({ slug }) => slug === block.block);
      if (!parent) {
        const sibling = children.find(({ slug }) => slug === block.block);
        if (sibling) return getParent(sibling);
      }
      return parent;
    }

    children.forEach((block) => {
      const parent = getParent(block);

      if (!parent) {
        roots.push(block);
        return;
      }
      parent.variants = [
        ...(parent.variants || []),
        { ...block, block: parent.slug },
      ];
    });
    return roots;
  }, [blocks]);

  const fetchSchema = useCallback(
    async (slug: string) => {
      if (!slug) return null;
      const inCatalog = blocks.find(({ slug: bslug }) => slug === bslug);

      if (!inCatalog) return;

      if (inCatalog.builtIn) {
        const schema = getEditSchema(slug);
        if (!schema) return;
        return schema;
      }
      if (inCatalog.url) {
        if (!CACHE.has(inCatalog.url)) {
          const module = await loadModule<BlockComponent>(inCatalog.url);
          if (module && module.schema) {
            CACHE.set(inCatalog.url, module.schema);
          }
        }
        return CACHE.get(inCatalog.url);
      }
      if (inCatalog.schema) {
        return inCatalog.schema;
      }
    },
    [blocks]
  );

  const getSchema = useCallback(
    async (slug): Promise<Schema | undefined> => {
      const schema = (await fetchSchema(slug)) || undefined;
      if (!schema) return schema;
      return localizeSchemaForm(await extendsSchema(schema, getSchema));
    },
    [fetchSchema, localizeSchemaForm]
  );

  return (
    <workspaceBlocksContext.Provider value={{ getSchema, blocks, variants }}>
      {children}
    </workspaceBlocksContext.Provider>
  );
};
export default BlocksProvider;
