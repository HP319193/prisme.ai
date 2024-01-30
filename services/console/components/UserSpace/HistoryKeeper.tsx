import { useRouter } from 'next/router';
import { Children, ReactElement, ReactNode, useEffect, useState } from 'react';
import Storage from '../../utils/Storage';

interface HistoryKeeperProps {
  children: ReactElement[];
}

export const HistoryKeeper = ({ children }: HistoryKeeperProps) => {
  const [histories, setHistories] = useState<Map<string, string>>(
    new Map(Storage.get('productsHistories'))
  );
  const router = useRouter();

  useEffect(() => {
    setHistories((histories) => {
      const newHistories = new Map(histories);
      Children.toArray(children).forEach(({ props: { href } }: any) => {
        if (newHistories.has(href)) return;
        newHistories.set(href, href);
      });
      Storage.set('productsHistories', Array.from(newHistories.entries()));
      return newHistories;
    });
  }, [children]);

  useEffect(() => {
    setHistories((histories) => {
      const newHistories = Array.from(histories.entries());
      const basePath = window.location.pathname.replace(/^\/[a-z]{2}/, '');
      return new Map(
        newHistories.map(([source, current]) => {
          if (basePath.match(source)) {
            return [
              source,
              `${window.location.pathname}${window.location.search}${window.location.hash}`,
            ];
          }
          return [source, current];
        })
      );
    });
  }, [router]);

  return (
    <>
      {Children.map(children, (child: ReactElement) => ({
        ...child,
        props: {
          ...child.props,
          href: histories.get(child.props.href) || child.props.href,
        },
      }))}
    </>
  );
};

export default HistoryKeeper;
