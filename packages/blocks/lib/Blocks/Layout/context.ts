import { createContext, useContext } from 'react';

export interface Block extends Record<string, any> {
  block: string;
  url?: string;
}

export interface Content {
  title: string;
  blocks: Block[];
}

export interface LayoutConfig {
  head: Block[];
  content: Content;
}

export interface LayoutContext extends Omit<LayoutConfig, 'content'> {
  history: Content[];
  back: () => void;
  headBox?: DOMRect;
  footBox?: DOMRect;
}

export const layoutContext = createContext<LayoutContext>({
  head: [],
  history: [],
  back() {},
});

export const useLayout = () => useContext(layoutContext);
