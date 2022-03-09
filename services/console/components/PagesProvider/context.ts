import { createContext, useContext } from 'react';

type WorkspaceId = string;

export interface PagesContext {
  pages: Map<WorkspaceId, Set<Prismeai.Page>>;
  fetchPages: (workspaceId: NonNullable<Prismeai.Workspace['id']>) => void;
  createPage: (
    workspaceId: NonNullable<Prismeai.Workspace['id']>,
    p: Prismeai.Page
  ) => Promise<Prismeai.Page>;
  savePage: (
    workspaceId: NonNullable<Prismeai.Workspace['id']>,
    p: Prismeai.Page
  ) => Promise<Prismeai.Page>;
  deletePage: (
    workspaceId: NonNullable<Prismeai.Workspace['id']>,
    pid: NonNullable<Prismeai.Page['id']>
  ) => Promise<Pick<Prismeai.Page, 'id'>>;
}

export const pagesContext = createContext<PagesContext>({
  pages: new Map(),
  fetchPages() {},
  async createPage() {
    return {} as Prismeai.Page;
  },
  async savePage() {
    return {} as Prismeai.Page;
  },
  async deletePage() {
    return {} as Prismeai.Page;
  },
});

export const usePages = () => useContext(pagesContext);

export default usePages;
