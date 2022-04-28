import { createContext, useContext } from 'react';

export interface PageBuilderContext {
  page: Omit<Prismeai.Page, 'blocks'> & {
    blocks: (Prismeai.Page['blocks'][number] & { key?: string })[];
  };
  blocks: {
    slug: string;
    appName: string;
    blocks: (Prismeai.Block & { slug: string })[];
  }[];
  addBlock: (position: number) => void;
  removeBlock: (key: string) => void;
  setBlockConfig: (key: string, config: any) => void;
}

export const context = createContext<PageBuilderContext>({
  page: {} as Prismeai.Page,
  blocks: [],
  addBlock() {},
  removeBlock() {},
  setBlockConfig() {},
});

export const usePageBuilder = () => useContext(context);
