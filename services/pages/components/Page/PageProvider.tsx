import { createContext, FC, useContext } from 'react';
import usePageEvents from './usePageEvents';
import usePageFetcher from './usePageFetcher';
import usePageParent from './usePageParent';

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
  events: undefined,
});

export const usePage = () => useContext(pageContext);

export interface PageProviderProps {
  page?: PageContext['page'];
  error?: number | null;
  styles?: string;
  initialConfig?: Record<string, any>[];
  clientId?: string;
}

export const PageProvider: FC<PageProviderProps> = ({
  page: pageFromServer,
  error,
  children,
}) => {
  const { page, setPage, loading, fetchPage } = usePageFetcher(
    pageFromServer || undefined,
    error || undefined
  );
  const { events } = usePageEvents(page);
  usePageParent(events, setPage);

  return (
    <pageContext.Provider
      value={{
        page,
        setPage,
        loading,
        fetchPage,
        events,
        error,
      }}
    >
      {children}
    </pageContext.Provider>
  );
};

export default pageContext;
