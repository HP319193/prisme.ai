import { builtinBlocks } from '@prisme.ai/blocks';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { useApps } from '../AppsProvider';
import { useWorkspace } from '../WorkspaceProvider';
import workspaceIcon from '../../icons/icon-workspace.svg';
import builtinBlocksVariants from './builtinBlocksVariants';

export interface BlockInCatalog extends Prismeai.Block {
  slug: string;
  builtIn?: boolean;
  from?: Prismeai.LocalizedText;
  variants?: BlockInCatalog[];
  icon?: string;
}

const builtInBlocksOrder = [
  'Header',
  'RichText',
  'Form',
  'DataTable',
  'Cards',
  'Layout',
];

export const useBlocks = () => {
  const { t } = useTranslation('workspaces');
  const {
    workspace: { id: workspaceId, name, blocks: workspaceBlocks, photo } = {},
  } = useWorkspace();
  const { appInstances } = useApps();

  const available: BlockInCatalog[] = useMemo(() => {
    const blocks: BlockInCatalog[] = [
      ...Object.keys(builtinBlocks)
        .sort(
          (a, b) =>
            builtInBlocksOrder.indexOf(a) - builtInBlocksOrder.indexOf(b)
        )
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
        ? Object.keys(workspaceBlocks).map((key) => ({
            ...workspaceBlocks[key],
            name: workspaceBlocks[key].name || key,
            from: name,
            slug: key,
            icon: photo || workspaceIcon.src,
          }))
        : []),
      // Apps blocks
      ...((workspaceId && appInstances.get(workspaceId)) || []).reduce<
        BlockInCatalog[]
      >((prev, { slug = '', appName = '', blocks, photo }) => {
        if (!blocks || blocks.length === 0) return prev;

        return [
          ...prev,
          ...blocks.map((block) => ({
            ...block,
            from: appName,
            slug: `${slug}.${block.slug}`,
            name: block.name || block.slug,
            icon: photo,
          })),
        ];
      }, []),
    ];
    return blocks.filter(({ slug, block }, k, all) => {
      return (
        !all.slice(0, k).find(({ slug: s }) => s === slug) &&
        (!block || all.find(({ slug }) => block === slug))
      );
    });
  }, [appInstances, name, photo, t, workspaceBlocks, workspaceId]);

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
