import { createContext, useContext } from 'react';

export interface PageBuilderContext {
  page: Omit<Prismeai.Page, 'widgets'> & {
    widgets: (Prismeai.Page['widgets'][number] & { key?: string })[];
  };
  widgets: { label: string; widgets: Record<string, Prismeai.Widget> }[];
  addWidget: (position: number) => void;
  removeWidget: (key: string) => void;
}

export const context = createContext<PageBuilderContext>({
  page: {} as Prismeai.Page,
  widgets: [],
  addWidget() {},
  removeWidget() {},
});

export const usePageBuilder = () => useContext(context);
