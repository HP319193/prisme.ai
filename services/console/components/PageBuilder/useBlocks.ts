import { builtinBlocks } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import workspaceIcon from '../../icons/icon-workspace.svg';
import builtinBlocksVariants from './builtinBlocksVariants';
import { useWorkspace } from '../../providers/Workspace';

export interface BlockInCatalog extends Prismeai.Block {
  slug: string;
  builtIn?: boolean;
  from?: Prismeai.LocalizedText;
  variants?: BlockInCatalog[];
  icon?: string;
}

const builtInBlocksOrder = [
  'Header',
  'Hero',
  'RichText',
  'Image',
  'Action',
  'Buttons',
  'Form',
  'DataTable',
  'Cards',
  'Breadcrumbs',
  'Footer',
  'BlocksList',
  'BlocksGrid',
  'Carousel',
  'StackedNavigation',
  'TabsView',
];

export const useBlocks = () => {
  const { t } = useTranslation('workspaces');
  const { workspace: { name, blocks: workspaceBlocks, photo, imports } = {} } =
    useWorkspace();

  const available: BlockInCatalog[] = useMemo(() => {
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

    available.forEach((block) => {
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
  }, [available]);

  return { available, variants };
};

export default useBlocks;
