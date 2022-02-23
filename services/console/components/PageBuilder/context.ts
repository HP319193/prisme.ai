import { createContext, useContext } from 'react';

export interface PageBuilderContext {
  page: Omit<Prismeai.Page, 'widgets'> & {
    widgets: (Prismeai.Page['widgets'][number] & { key?: string })[];
  };
  widgets: Record<string, Prismeai.Widget>;
  addWidget: (position: number) => void;
  resizeWidget: (key: string, height: number) => void;
}

export const context = createContext<PageBuilderContext>({
  page: {} as Prismeai.Page,
  widgets: {},
  addWidget() {},
  resizeWidget() {},
});

export const usePageBuilder = () => useContext(context);
