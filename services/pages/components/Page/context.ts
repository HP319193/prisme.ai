import { createContext, useContext } from 'react';

export interface PageContext {
  page: Prismeai.Page | null;
  setPage: (page: Prismeai.Page) => void;
}
export const pageContext = createContext<PageContext>({
  page: null,
  setPage() {},
});

export const usePage = () => useContext(pageContext);

export default pageContext;
