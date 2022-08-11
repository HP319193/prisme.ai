import { createContext, useContext } from 'react';

export interface appInstanceWithSlug extends Prismeai.DetailedAppInstance {
  slug: string;
}

export interface AppsContext {
  apps: Map<string, Prismeai.App>;
  appInstances: Map<string, Prismeai.DetailedAppInstance[]>;
  getApps: ({
    query,
    page,
    limit,
    workspaceId,
  }: {
    query?: PrismeaiAPI.SearchApps.QueryParameters['text'];
    page?: PrismeaiAPI.SearchApps.QueryParameters['page'];
    limit?: PrismeaiAPI.SearchApps.QueryParameters['limit'];
    workspaceId?: PrismeaiAPI.SearchApps.QueryParameters['workspaceId'];
  }) => Promise<Prismeai.App[] | null>;
  getAppInstances: (
    workspaceId: PrismeaiAPI.ListAppInstances.PathParameters['workspaceId']
  ) => Promise<Prismeai.DetailedAppInstance[]>;
  saveAppInstance: (
    workspaceId: PrismeaiAPI.ConfigureAppInstance.PathParameters['workspaceId'],
    slug: PrismeaiAPI.ConfigureAppInstance.PathParameters['slug'],
    newAppInstance: PrismeaiAPI.ConfigureAppInstance.RequestBody
  ) => Promise<PrismeaiAPI.ConfigureAppInstance.Responses.$200 | undefined>;
}

export const appsContext = createContext<AppsContext>({
  apps: new Map(),
  appInstances: new Map(),
  getApps: async () => ({} as any),
  getAppInstances: async () => ({} as any),
  saveAppInstance: () => ({} as any),
});

export const useApps = () => useContext(appsContext);

export default appsContext;
