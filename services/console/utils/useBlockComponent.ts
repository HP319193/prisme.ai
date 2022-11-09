import { BlockComponent, builtinBlocks } from '@prisme.ai/blocks';
import { useEffect, useState } from 'react';
import { useApps } from '../components/AppsProvider';
import { useWorkspace } from '../components/WorkspaceProvider';
import { Workspace } from './api';
import externals from '../utils/externals';

// @ts-ignore
if (process.browser) {
  // @ts-ignore
  window.__external = {
    // @ts-ignore
    ...(window.__external || {}),
    ...externals,
  };
}

interface GetBlockUrlAttrs {
  workspaceBlocks: Workspace['blocks'];
  apps: Prismeai.DetailedAppInstance[];
  blockName: string;
}

const CACHES: Map<string, BlockComponent | null> = new Map();

function isBlockComponent(
  block: BlockComponent | string
): block is BlockComponent {
  return typeof block === 'function';
}

export function loadExternalComponent(url: string): Promise<BlockComponent> {
  return new Promise((resolve, reject) => {
    const uniqMethod = `__load_${(Math.random() * 1000).toFixed()}`;
    // @ts-ignore
    window[uniqMethod] = (module) => {
      // @ts-ignore
      delete window[uniqMethod];
      document.body.removeChild(s);
      const { default: dft, ...other } = module;
      Object.entries(other).forEach(([k, v]) => (dft[k] = v));
      resolve(dft);
    };
    // @ts-ignore
    window[`${uniqMethod}_error`] = (e) => {
      reject(e);
    };
    const s = document.createElement('script');

    s.innerHTML = `
  import * as module from '${url}';
  try {
    window['${uniqMethod}'](module);
  } catch (e) {
    window['${uniqMethod}_error'](e);
  }
  `;
    s.type = 'module';
    document.body.appendChild(s);
  });
}

export async function loadBlockComponent(
  block: BlockComponent | string | null
) {
  if (!block) return null;
  if (isBlockComponent(block)) {
    return block;
  }
  return loadExternalComponent(block);
}

export async function getBlockComponent({
  workspaceBlocks,
  apps,
  blockName,
}: GetBlockUrlAttrs) {
  if (!CACHES.has(blockName)) {
    console.log(builtinBlocks);
    const blocks: Record<string, BlockComponent | string> = {
      ...workspaceBlocks,
      ...apps.reduce(
        (prev, { appSlug, blocks }) => ({
          ...prev,
          ...blocks.reduce(
            (appBlocks, { slug, url }) => ({
              ...appBlocks,
              [`${appSlug}.${slug}`]: url,
            }),
            {}
          ),
        }),
        { ...builtinBlocks }
      ),
    };
    const block = blocks[blockName as keyof typeof blocks];
    try {
      CACHES.set(blockName, await loadBlockComponent(block));
    } catch (e) {
      console.error(e);
      CACHES.set(blockName, null);
    }
  }
  return CACHES.get(blockName) || null;
}

export const useBlockComponent = (blockName: string) => {
  const { workspace } = useWorkspace();
  const { appInstances } = useApps();
  const [block, setBlock] = useState<BlockComponent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getBlock() {
      setLoading(true);
      const block = await getBlockComponent({
        workspaceBlocks: workspace.blocks,
        apps: appInstances.get(workspace.id) || [],
        blockName,
      });
      setBlock(() => block);
      setLoading(false);
    }
    getBlock();
  }, [appInstances, blockName, workspace.blocks, workspace.id]);
  return { loading, block };
};

export default useBlockComponent;
