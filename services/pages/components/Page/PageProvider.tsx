import { FC, useEffect, useState } from 'react';
import context, { PageContext } from './context';

export const PageProvider: FC = ({ children }) => {
  const [page, setPage] = useState<PageContext['page']>(null);

  useEffect(() => {
    // For preview in console
    const listener = (e: MessageEvent) => {
      const { type, page } = e.data;
      if (type === 'updatePagePreview') {
        setPage(page);
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  return (
    <context.Provider value={{ page, setPage }}>{children}</context.Provider>
  );
};

export default PageProvider;
