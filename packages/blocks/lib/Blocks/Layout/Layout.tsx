import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlock } from '../../Provider';
import ContentContainer from './ContentContainer';
import { LayoutConfig, layoutContext } from './context';
import Head from './Head';
import tw from '../../tw';

interface LayoutProps {
  edit?: boolean;
}

const EmptyArray: any[] = [];

export const Layout = ({ edit }: LayoutProps) => {
  const { config } = useBlock<LayoutConfig>();
  const { head = EmptyArray, content } = config || {};
  const [history, setHistory] = useState<LayoutConfig['content'][]>([]);
  const headEl = useRef<HTMLDivElement>(null);
  const [headBox, setHeadBox] = useState<DOMRect>();
  console.log({ config });
  useEffect(() => {
    if (!headEl.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const { contentRect } of entries) {
        setHeadBox(contentRect);
      }
    });
    observer.observe(headEl.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!content) return;
    setHistory((prevHistory) => {
      const history = [...prevHistory];
      const lastContent = history.pop();
      if (lastContent && lastContent.title === content.title) {
        return [...history, content];
      }
      // add new entry
      return [...prevHistory, content];
    });
  }, [content]);

  const back = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 1) return prevHistory;
      const history = [...prevHistory];
      history.pop();
      return history;
    });
  }, []);

  if (edit) {
    return <div>…</div>;
  }

  return (
    <layoutContext.Provider
      value={{
        head,
        history,
        back,
        headBox,
      }}
    >
      <div className={tw`fixed top-0 left-0 right-0 z-50`} ref={headEl}>
        <Head />
      </div>
      <ContentContainer />
    </layoutContext.Provider>
  );
};

export default Layout;
