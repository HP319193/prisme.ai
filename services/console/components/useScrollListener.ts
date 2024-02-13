import { useCallback, useState } from 'react';

interface IUseScrollListener {
  margin?: number;
}

export const useScrollListener = <T extends HTMLElement>({
  margin = 0,
}: IUseScrollListener = {}): {
  ref: (element: T) => void;
  top: boolean;
  bottom: boolean;
} => {
  const [top, setTop] = useState<boolean>(false);
  const [bottom, setBottom] = useState<boolean>(false);

  const ref = useCallback(
    (element: T) => {
      console.log(element);
      const listener = (e: Event) => {
        const target = e.target as T;
        if (!target) return;
        const { scrollHeight, offsetHeight, scrollTop } = target;

        setBottom(scrollTop - margin >= scrollHeight - offsetHeight);
        setTop(scrollTop <= margin);
      };
      if (element) {
        element.addEventListener('scroll', listener);
      }
      return () => {
        element.removeEventListener('scroll', listener);
      };
    },
    [margin]
  );

  return { ref, bottom, top };
};

export default useScrollListener;
