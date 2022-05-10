import { createContext, useContext } from 'react';
import { Schema } from '@prisme.ai/design-system';

export type blockWithKey = Prismeai.Page['blocks'][number] & { key?: string };

export interface PageBuilderContext {
  page: Omit<Prismeai.Page, 'blocks'> & {
    blocks: blockWithKey[];
  };
  blocks: {
    slug: string;
    appName: string;
    blocks: (Prismeai.Block & { slug: string })[];
  }[];
  blocksInPage: {
    key: string;
    appName: string;
    component?: any;
    name?: Prismeai.LocalizedText;
    edit?: Schema | Prismeai.TypedArgument;
    appInstance?: string;
    url?: string;
  }[];
  addBlock: (position: number) => void;
  setEditBlock: (blockId: string) => void;
  removeBlock: (key: string) => void;
  setBlockConfig: (key: string, config: any) => void;
}

export const context = createContext<PageBuilderContext>({
  page: {} as Prismeai.Page,
  blocks: [],
  blocksInPage: [],
  addBlock() {},
  setEditBlock() {},
  removeBlock() {},
  setBlockConfig() {},
});

export const usePageBuilder = () => useContext(context);
