import { FC, useEffect, useRef, useState } from 'react';

interface StretchContentProps {
  visible: boolean;
  className?: string;
}

export const StretchContent: FC<StretchContentProps> = ({
  visible,
  className,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<-2 | -1 | 1 | 2>(visible ? 2 : -2);

  useEffect(() => {
    if (!ref.current || !ref.current.firstChild || state === -2) return;
    const { current } = ref;
    const child = ref.current.firstChild as HTMLElement;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          const { height } = entry.contentRect;
          current.style.height = `${state === 2 ? height : 0}px`;
        }
      }
    });
    resizeObserver.observe(child);

    current.style.height = `${
      state === 2 ? child.getBoundingClientRect().height : 0
    }px`;

    return () => {
      resizeObserver.unobserve(child);
      resizeObserver.disconnect();
    };
  }, [state]);

  useEffect(() => {
    setState((current) => {
      if ((visible && current > 0) || (!visible && current < 0)) {
        return current;
      }
      if (visible) {
        setTimeout(() => {
          setState(2);
        });
        return 1;
      }
      if (!visible) {
        setTimeout(() => {
          setState(-2);
        }, 200);
        return -1;
      }
      return current;
    });
  }, [visible]);

  if (state === -2) return null;

  return (
    <div
      ref={ref}
      className={`transition-[height] overflow-hidden will-change-contents ${
        className || ''
      }`}
    >
      <div>{children}</div>
    </div>
  );
};

export default StretchContent;
