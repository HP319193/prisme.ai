import { createContext, useContext } from 'react';

export interface AppsContext {
  apps: Map<string, Prismeai.App>;
  getApps: (
    query?: PrismeaiAPI.SearchApps.QueryParameters['query'],
    page?: PrismeaiAPI.SearchApps.QueryParameters['page']
  ) => Promise<Map<string, Prismeai.App> | null>;
}

export const appsContext = createContext<AppsContext>({
  apps: new Map(),
  getApps: async () => ({} as any),
});

export const useApps = () => useContext(appsContext);

export default appsContext;
