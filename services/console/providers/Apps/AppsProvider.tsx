import {
  createContext,
  ReactNode,
  useState,
  useCallback,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import api from '../../utils/api';
import { useContext } from '../../utils/useContext';

interface App extends Omit<Prismeai.App, 'createdAt' | 'updatedAt'> {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppsContext {
  apps: Set<App>;
  loading: boolean;
  fetchApps: () => Promise<App[]>;
  filters: Parameters<typeof api.getApps>[0];
  fetchNextApps: () => void;
  setFilters: Dispatch<SetStateAction<AppsContext['filters']>>;
  hasMore: boolean;
}

interface AppsProviderProps {
  children: ReactNode;
}

export const appsContext = createContext<AppsContext | undefined>(undefined);

export const useApps = () => useContext<AppsContext>(appsContext);

const PER_PAGE = 50;
const EMPTY_FILTERS: AppsContext['filters'] = {};

export const AppsProvider = ({ children }: AppsProviderProps) => {
  const [apps, setApps] = useState<AppsContext['apps']>(new Set());
  const [loading, setLoading] = useState<AppsContext['loading']>(true);
  const [filters, setFilters] = useState<AppsContext['filters']>(EMPTY_FILTERS);

  const lastPage = useRef(0);
  const hasMore = useRef(true);
  const fetching = useRef(false);
  const fetchApps: AppsContext['fetchApps'] = useCallback(async () => {
    try {
      fetching.current = true;
      const withLimit = {
        limit: PER_PAGE,
        page: lastPage.current++,
        ...filters,
      };
      const apps = await api.getApps(withLimit);
      hasMore.current = apps.length === withLimit.limit;
      fetching.current = false;
      return apps.map(({ createdAt, updatedAt, ...app }) => ({
        ...app,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        updatedAt: updatedAt ? new Date(updatedAt) : undefined,
      }));
    } catch (e) {
      return [];
    }
  }, [filters]);

  const fetchNextApps: AppsContext['fetchNextApps'] = useCallback(async () => {
    if (!hasMore.current) return;
    try {
      if (fetching.current) {
        throw new Error();
      }

      const next = await fetchApps();

      if (next.length === 0) {
        throw new Error();
      }
      setApps((apps) => new Set([...Array.from(apps), ...next]));
      return apps;
    } catch {
      return [];
    }
  }, [apps, fetchApps]);

  // Fetch first page on init or when filters changes
  useEffect(() => {
    const initApps = async () => {
      setLoading(true);
      lastPage.current = 0;
      const apps = await fetchApps();
      setApps(new Set(apps));
      setLoading(false);
    };
    // Delay in case of filters coming in quasi same time
    const t = setTimeout(initApps, 500);
    return () => {
      clearTimeout(t);
    };
  }, [fetchApps]);

  return (
    <appsContext.Provider
      value={{
        apps,
        loading,
        fetchApps,
        filters,
        setFilters,
        fetchNextApps,
        hasMore: hasMore.current,
      }}
    >
      {children}
    </appsContext.Provider>
  );
};

export default AppsProvider;
