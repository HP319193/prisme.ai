import { LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons';
import {
  HTMLAttributes,
  ReactChild,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

interface FadeScrollProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactChild[];
}

export const FadeScroll = ({
  children,
  className,
  ...props
}: FadeScrollProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);

  useLayoutEffect(() => {
    const { current } = ref;
    if (!current) return;
    const listener = (e: Event) => {
      if (!childrenRef.current) return;
      const target = e.target as HTMLDivElement;
      const { children } = childrenRef.current;
      const {
        width: scrollWidth,
        left: containerLeft,
      } = target.getBoundingClientRect();

      Array.from(children).forEach((c, k) => {
        const { right } = c.getBoundingClientRect();
        const opacity =
          right - containerLeft > 0 && right - containerLeft < scrollWidth
            ? 1
            : Math.min(
                1,
                1 + (scrollWidth - (right - containerLeft)) / scrollWidth / 0.5
              );

        const style = (c as HTMLElement).style;
        style.opacity = `${opacity}`;
        style.scrollSnapAlign = 'start';
      });

      setShowPrev(target.scrollLeft !== 0);
      setShowNext(
        target.scrollLeft + target.offsetWidth !== target.scrollWidth
      );
    };
    current.addEventListener('scroll', listener);

    return () => {
      current.removeEventListener('scroll', listener);
    };
  }, []);

  const scroll = useCallback((direction: 1 | -1) => {
    const { current } = ref;
    if (!current) return;
    current.scrollBy({ left: direction * 10, behavior: 'smooth' });
  }, []);
  const scrollNext = useCallback(() => {
    scroll(+1);
  }, [scroll]);
  const scrollPrev = useCallback(() => {
    scroll(-1);
  }, [scroll]);

  return (
    <div className={`flex relative overflow-hidden ${className}`}>
      <div
        ref={ref}
        className={`flex relative overflow-auto ${className}`}
        style={{
          scrollSnapType: 'x mandatory',
        }}
        {...props}
      >
        <div ref={childrenRef} className="flex flex-1">
          {children}
        </div>
      </div>
      {showPrev && (
        <button
          className="absolute left-0 top-[37%] !text-light-gray focus:outline-none text-xl"
          onClick={scrollPrev}
        >
          <LeftCircleOutlined className="bg-white" />
        </button>
      )}
      {showNext && (
        <button
          className="absolute right-0 top-[37%] !text-light-gray focus:outline-none text-xl"
          onClick={scrollNext}
        >
          <RightCircleOutlined className="bg-white" />
        </button>
      )}
    </div>
  );
};

export default FadeScroll;
