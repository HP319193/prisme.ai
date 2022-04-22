import { FC, useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (!ref.current || !ref.current.firstChild) return;
    const { current } = ref;
    const child = ref.current.firstChild as HTMLElement;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          const { height } = entry.contentRect;
          current.style.height = `${visible ? height : 0}px`;
        }
      }
    });
    resizeObserver.observe(child);

    current.style.height = `${
      visible ? child.getBoundingClientRect().height : 0
    }px`;

    return () => {
      resizeObserver.unobserve(child);
      resizeObserver.disconnect();
    };
  }, [visible]);

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
