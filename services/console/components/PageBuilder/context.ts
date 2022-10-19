import { createContext, useContext } from 'react';
import { Schema } from '@prisme.ai/design-system';
import { Events } from '../../utils/api';
import { BlockInCatalog } from './useBlocks';

export type blockWithKey = Prismeai.Page['blocks'][number] & { key?: string };

export interface PageBuilderContext {
  page: Omit<Prismeai.Page, 'blocks'> & {
    blocks: blockWithKey[];
  };
  blocks: {
    slug: string;
    appName: Prismeai.LocalizedText;
    blocks: (Prismeai.Block & { slug: string })[];
  }[];
  blocksInPage: {
    key: string;
    appName: Prismeai.LocalizedText;
    name?: Prismeai.LocalizedText;
    appInstance?: string;
    url?: string;
    edit?: Schema | Prismeai.TypedArgument;
  }[];
  addBlock: (position: number) => void;
  setEditBlock: (blockId: string) => void;
  removeBlock: (key: string) => void;
  setBlockConfig: (key: string, config: any) => void;
  setBlockSchema: (blockId: string, schema: Schema) => void;
  events?: Events;
  catalog: BlockInCatalog[];
}

export const context = createContext<PageBuilderContext>({
  page: {} as Prismeai.Page,
  blocks: [],
  blocksInPage: [],
  addBlock() {},
  setEditBlock() {},
  removeBlock() {},
  setBlockConfig() {},
  setBlockSchema() {},
  catalog: [],
});

export const usePageBuilder = () => useContext(context);
