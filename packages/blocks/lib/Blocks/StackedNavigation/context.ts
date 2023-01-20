import { createContext, useContext } from 'react';

export interface Block extends Record<string, any> {
  // @deprecated
  block?: string;
  slug: string;
}

export interface Content {
  title: string;
  blocks: Block[];
}

export interface StackedNavigationConfig {
  head: Block[];
  content: Content;
}

export interface StackedNavigationContext
  extends Omit<StackedNavigationConfig, 'content'> {
  history: Content[];
  back: () => void;
  headBox?: DOMRect;
  footBox?: DOMRect;
}

export const stackedNavigationContext = createContext<StackedNavigationContext>(
  {
    head: [],
    history: [],
    back() {},
  }
);

export const useStackedNavigation = () => useContext(stackedNavigationContext);
