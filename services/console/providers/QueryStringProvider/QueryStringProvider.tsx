import { useRouter } from 'next/router';
import {
  createContext,
  FC,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import { useContext } from '../../utils/useContext';

export interface QueryStringProviderContext {
  setQueryString: Dispatch<SetStateAction<URLSearchParams>>;
  queryString: URLSearchParams;
}

export const queryStringContext = createContext<
  QueryStringProviderContext | undefined
>(undefined);

export const useQueryString = () =>
  useContext<QueryStringProviderContext>(queryStringContext);

const initialQueryString = new URLSearchParams();

export const QueryStringProvider: FC = ({ children }) => {
  const [queryString, setQueryString] = useState(initialQueryString);
  const router = useRouter();

  useEffect(() => {
    setQueryString(new URLSearchParams(window.location.search));
  }, [router]);

  useEffect(() => {
    const newQueryString = new URLSearchParams(window.location.search);
    if (initialQueryString.toString() === newQueryString.toString()) return;
    setQueryString(newQueryString);
  }, []);

  useEffect(() => {
    // Clean empty fields
    const q = new URLSearchParams(
      Object.fromEntries(
        Array.from(queryString.entries()).filter(([k, v]) => k && v)
      )
    ).toString();
    if (q === window.location.search) return;

    history.pushState(
      null,
      '',
      `${window.location.pathname}${q ? `?${q}` : ''}`
    );
  }, [queryString]);
  return (
    <queryStringContext.Provider value={{ queryString, setQueryString }}>
      {children}
    </queryStringContext.Provider>
  );
};

export default QueryStringProvider;
