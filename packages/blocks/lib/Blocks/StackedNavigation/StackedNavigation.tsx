import ResizeObserver from 'resize-observer-polyfill';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlock } from '../../Provider';
import ContentContainer from './ContentContainer';
import { StackedNavigationConfig, stackedNavigationContext } from './context';
import Head from './Head';
import tw from '../../tw';
import { BlockComponent } from '../../BlockLoader';

const EmptyArray: any[] = [];

export const StackedNavigation: BlockComponent = () => {
  const { config } = useBlock<StackedNavigationConfig>();
  const { head = EmptyArray, content } = config || {};
  const [history, setHistory] = useState<StackedNavigationConfig['content'][]>(
    []
  );
  const headEl = useRef<HTMLDivElement>(null);
  const [headBox, setHeadBox] = useState<DOMRect>();

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

  return (
    <stackedNavigationContext.Provider
      value={{
        head,
        history,
        back,
        headBox,
      }}
    >
      <div
        className={tw`block-layout__head head fixed flex-1 top-0 left-0 right-0 z-50`}
        ref={headEl}
      >
        <Head />
      </div>
      <ContentContainer />
    </stackedNavigationContext.Provider>
  );
};

export default StackedNavigation;
