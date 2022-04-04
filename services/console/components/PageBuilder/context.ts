import { createContext, useContext } from 'react';

export interface PageBuilderContext {
  page: Omit<Prismeai.Page, 'widgets'> & {
    widgets: (Prismeai.Page['widgets'][number] & { key?: string })[];
  };
  widgets: {
    slug: string;
    appName: string;
    widgets: (Prismeai.Widget & { slug: string })[];
  }[];
  addWidget: (position: number) => void;
  removeWidget: (key: string) => void;
  setWidgetConfig: (key: string, config: any) => void;
}

export const context = createContext<PageBuilderContext>({
  page: {} as Prismeai.Page,
  widgets: [],
  addWidget() {},
  removeWidget() {},
  setWidgetConfig() {},
});

export const usePageBuilder = () => useContext(context);
