import { useCallback, useEffect, useMemo, useState } from 'react';
import Content from './Content';
import {
  Content as IContent,
  StackedNavigationContext,
  useStackedNavigation,
} from './context';
import tw from '../../tw';

interface ContentContainerProps {
  history: StackedNavigationContext['history'];
  marginTop: number;
  marginBottom: number;
}

interface Page {
  content: IContent;
  removed: boolean;
}

export const ContentContainerRenderer = ({
  history,
  marginTop,
}: ContentContainerProps) => {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    setPages((pages) => {
      // Update content case
      if (
        history.length &&
        pages.length &&
        pages[pages.length - 1].content.title ===
          history[history.length - 1].title
      ) {
        return pages.map((page, index) =>
          index === pages.length - 1
            ? {
                content: history[history.length - 1],
                removed: false,
              }
            : page
        );
      }

      // A new page appears
      if (history.length > pages.length) {
        return [
          ...pages,
          {
            content: [...history].pop()!,
            removed: false,
          },
        ];
      }

      //
      return pages.map((page, k) =>
        k === pages.length - 1
          ? {
              ...page,
              removed: true,
            }
          : page
      );
    });
  }, [history]);

  const onUnmount = useCallback(() => {
    const newPages = [...pages];
    newPages.pop();
    setPages(newPages);
  }, [pages]);

  return (
    <div
      className={tw`block-layout__content-stack content-stack h-screen flex`}
    >
      <div className={tw`flex-1 relative mt-[${marginTop}px]`}>
        {pages.map(({ content, removed }, index) => (
          <Content
            key={index}
            className={tw`absolute overflow-auto top-0 left-0 right-0 bottom-0`}
            content={content}
            onUnmount={onUnmount}
            removed={removed}
          />
        ))}
      </div>
    </div>
  );
};

export const ContentContainer = () => {
  const { history, headBox } = useStackedNavigation();
  const marginTop = headBox ? +headBox.height.toFixed() : 0;
  return useMemo(
    () => (
      <ContentContainerRenderer
        history={history}
        marginTop={marginTop}
        marginBottom={0}
      />
    ),
    [history, marginTop]
  );
};
export default ContentContainer;
