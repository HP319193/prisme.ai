import { createContext, useContext } from 'react';
import api from '../../utils/api';
export interface AppsContext {
  apps: Map<string, Prismeai.App>;
  appInstances: Map<string, Prismeai.DetailedAppInstance[]>;
  getApps: (
    query?: PrismeaiAPI.SearchApps.QueryParameters['query'],
    page?: PrismeaiAPI.SearchApps.QueryParameters['page']
  ) => Promise<Map<string, Prismeai.App> | null>;
  getAppInstances: (
    workspaceId: PrismeaiAPI.ListAppInstances.PathParameters['workspaceId']
  ) => Promise<Prismeai.DetailedAppInstance[]>;
}

export const appsContext = createContext<AppsContext>({
  apps: new Map(),
  appInstances: new Map(),
  getApps: async () => ({} as any),
  getAppInstances: async () => ({} as any),
});

export const useApps = () => useContext(appsContext);

export default appsContext;
