import { useRouter } from 'next/router';
import {
  createContext,
  FC,
  useContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';

interface QueryStringProviderContext {
  setQueryString: Dispatch<SetStateAction<URLSearchParams>>;
  queryString: URLSearchParams;
}

export const context = createContext<QueryStringProviderContext>({
  setQueryString() {},
  queryString: new URLSearchParams(),
});

export const useQueryString = () => useContext(context);

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
    if (queryString === initialQueryString) return;
    const q = queryString.toString();

    history.pushState(
      null,
      '',
      `${window.location.pathname}${q ? `?${q}` : ''}`
    );
  }, [queryString]);
  return (
    <context.Provider value={{ queryString, setQueryString }}>
      {children}
    </context.Provider>
  );
};

export default QueryStringProvider;
