import { createContext, FC, useContext } from 'react';
import usePageEvents from './usePageEvents';
import usePageFetcher from './usePageFetcher';

export interface PageContext
  extends ReturnType<typeof usePageFetcher>,
    ReturnType<typeof usePageEvents> {}
export const pageContext = createContext<PageContext>({
  page: null,
  setPage() {},
  loading: false,
  async fetchPage() {},
  blocksConfigs: [],
  events: undefined,
});

export const usePage = () => useContext(pageContext);

export const PageProvider: FC = ({ children }) => {
  const { page, setPage, loading, fetchPage } = usePageFetcher();
  const { blocksConfigs, events } = usePageEvents(page);

  return (
    <pageContext.Provider
      value={{ page, setPage, loading, fetchPage, blocksConfigs, events }}
    >
      {children}
    </pageContext.Provider>
  );
};

export default pageContext;
