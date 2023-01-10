import { createContext, FC, useContext } from 'react';
import usePageEvents from './usePageEvents';
import usePageFetcher from './usePageFetcher';

export interface PageContext
  extends ReturnType<typeof usePageFetcher>,
    ReturnType<typeof usePageEvents> {
  error?: number | null;
}
export const pageContext = createContext<PageContext>({
  page: null,
  setPage() {},
  loading: false,
  async fetchPage() {},
  blocksConfigs: [],
  events: undefined,
});

export const usePage = () => useContext(pageContext);

export interface PageProviderProps {
  page?: PageContext['page'];
  error?: number | null;
  initialConfig?: Record<string, any>[];
}

export const PageProvider: FC<PageProviderProps> = ({
  page: pageFromServer,
  error,
  initialConfig,
  children,
}) => {
  const { page, setPage, loading, fetchPage } = usePageFetcher(
    pageFromServer || undefined
  );
  const { blocksConfigs, events } = usePageEvents(page, initialConfig);

  return (
    <pageContext.Provider
      value={{
        page,
        setPage,
        loading,
        fetchPage,
        blocksConfigs,
        events,
        error,
      }}
    >
      {children}
    </pageContext.Provider>
  );
};

export default pageContext;
