import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlock } from '../../Provider';
import { useBlocks } from '../../Provider/blocksContext';
import { BaseBlock } from '../BaseBlock';
import { BlocksListConfig } from '../BlocksList';
import { BaseBlockConfig } from '../types';

export interface CarouselConfig extends BaseBlockConfig, BlocksListConfig {
  autoscroll?: {
    active: boolean;
    speed?: number;
  };
  displayIndicators?: boolean;
}

interface CarouselProps extends CarouselConfig {}

function getStepsWidths(container: HTMLElement) {
  return Array.from(container.children).map(
    (el) => (el as HTMLElement).offsetWidth
  );
}

export const Carousel = ({
  className,
  autoscroll: {
    active: autoscrollIsActive = true,
    speed: autoscrollSpeed = 5,
  } = {
    active: true,
  },
  displayIndicators,
  ...props
}: CarouselProps) => {
  const {
    utils: { BlockLoader },
  } = useBlocks();
  const container = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const scroll = useCallback(
    (step: 1 | -1 | 'screen') => () => {
      const { current } = container;
      if (!current) return;
      const child = current.firstChild as HTMLDivElement;
      if (!child) return;
      const currentLeft = child.scrollLeft;

      setTimeout(() => {
        if (currentLeft !== child.scrollLeft) return;

        const from =
          step === 'screen'
            ? child.offsetWidth + child.scrollLeft
            : child.scrollLeft;

        if (from === 0 && step === -1) {
          child.scrollTo({
            left: child.scrollWidth,
            top: 0,
            behavior: 'smooth',
          });
          return;
        }
        const stepsWidths = getStepsWidths(child);
        const currentStep = stepsWidths.reduce<{ width: number; key?: number }>(
          (prev, next, index) => {
            if (prev.key !== undefined) return prev;
            if (prev.width >= from) {
              const width =
                step === 'screen'
                  ? prev.width
                  : step === 1
                  ? prev.width + next
                  : prev.width - stepsWidths[index - 1] || 0;
              return {
                width:
                  width > child.scrollWidth - child.offsetWidth ? 0 : width,
                key: index,
              };
            }
            return {
              width: prev.width + next,
            };
          },
          { width: 0 }
        );

        child.scrollTo({
          left: currentStep.width,
          top: 0,
          behavior: 'smooth',
        });
      }, 50);
    },
    []
  );

  const indicators = props.blocks?.length || 0;
  const [currentIndicator, setCurrentIndicator] = useState(-1);

  useEffect(() => {
    const scrollingEl = container.current?.querySelector(
      '.pr-block-carousel__content'
    );
    const listener = () => {
      if (!scrollingEl) return;
      const children = Array.from(scrollingEl.children) as HTMLElement[];

      const currentPage = children.reduce((prev, child, k) => {
        if (prev > -1) return prev;
        const { width } = child.getBoundingClientRect();
        const left = child.offsetLeft;
        const right = left + width;

        if (left <= scrollingEl.scrollLeft && right > scrollingEl.scrollLeft) {
          return k;
        }
        return prev;
      }, -1);
      setCurrentIndicator(currentPage);
    };
    scrollingEl?.addEventListener('scroll', listener);
    setTimeout(listener);
    return () => {
      scrollingEl?.removeEventListener('scroll', listener);
    };
  }, [container.current]);

  const scrollTo = useCallback((step: number) => {
    const scrollingEl = container.current?.querySelector(
      '.pr-block-carousel__content'
    );
    if (!scrollingEl) return;
    const children = Array.from(scrollingEl.children) as HTMLElement[];
    const left = children
      .splice(0, step)
      .reduce((prev, child) => prev + child.offsetWidth, 0);
    scrollingEl.scrollTo({
      left,
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          return scroll(-1)();
        case 'ArrowRight':
          return scroll(1)();
      }
    };
    document.body.addEventListener('keydown', listener);

    return () => {
      document.body.removeEventListener('keydown', listener);
    };
  }, [scroll]);

  useEffect(() => {
    if (!autoscrollIsActive) return;
    const { current } = container;
    if (!current) return;
    const child = current.firstChild as HTMLDivElement;
    if (!child) return;
    const interval = setInterval(() => {
      scroll('screen')();
    }, (autoscrollSpeed || 1) * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [autoscrollIsActive, autoscrollSpeed, container.current]);

  const [canScroll, setCanScroll] = useState<boolean | null>(false);
  useEffect(() => {
    const t = setInterval(() => {
      const { current } = container;
      if (!current) return;
      const child = current.firstChild as HTMLDivElement;
      if (!child) return;
      setCanScroll(child.scrollWidth > child.getBoundingClientRect().width);
    }, 200);
    return () => {
      clearInterval(t);
    };
  }, []);

  return (
    <div ref={container} className={`pr-block-carousel ${className}`}>
      <BlockLoader
        name="BlocksList"
        config={{ ...props, className: 'pr-block-carousel__content' }}
      />
      {canScroll && (
        <>
          {displayIndicators && (
            <div className="pr-block-carousel__indicators">
              {Array.from(new Array(indicators), (v, k) => k).map((k) => (
                <button
                  key={k}
                  className={`pr-block-carousel__indicator ${
                    currentIndicator === k
                      ? 'pr-block-carousel__indicator--current'
                      : ''
                  }`}
                  aria-label={`display page ${k}`}
                  onClick={() => scrollTo(k)}
                />
              ))}
            </div>
          )}
          <div className="pr-block-carousel__arrows">
            <div className="pr-block-carousel__arrow pr-block-carousel__arrow--left">
              <Tooltip title={t('cards.prev')} placement="right">
                <button
                  onClick={scroll(-1)}
                  className="pr-block-carousel__arrow__button"
                  aria-label="display previous page"
                >
                  <ArrowLeftOutlined className="pr-block-carousel__arrow__icon" />
                </button>
              </Tooltip>
            </div>
            <div className="pr-block-carousel__arrow pr-block-carousel__arrow--right">
              <Tooltip title={t('cards.next')} placement="left">
                <button
                  onClick={scroll(1)}
                  className="pr-block-carousel__arrow__button"
                  aria-label="display next page"
                >
                  <ArrowRightOutlined className="pr-block-carousel__arrow__icon" />
                </button>
              </Tooltip>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const defaultStyles = `:block {
  position: relative;
}

.pr-block-carousel__content {
  display: flex;
  flex-direction: row;
  overflow: auto;
  scroll-snap-type: x mandatory;
}
.pr-block-carousel__content > .pr-block-blocks-list__block {
  scroll-snap-align: start;
}

.pr-block-carousel__arrows {
  color: white;
  opacity: 0;
  transition: opacity .2s ease-in;
}
:block:hover .pr-block-carousel__arrows {
  opacity: 1;
}

.pr-block-carousel__arrow {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 40%;
  height: 2rem;
  width: 2rem;
  background: black;
  border-radius: 100%;
  box-shadow: 0 0 1rem rgba(0,0,0,.8);
}

.pr-block-carousel__arrow--left {
  left: 1rem;
}

.pr-block-carousel__arrow--right {
  right: 1rem;
}
.pr-block-blocks-list > .pr-block-blocks-list__block {
  flex-shrink: 0;
}
.pr-block-carousel__indicators {
  display: flex;
  margin-left: 3rem;
}
.pr-block-carousel__indicator {
  display: flex;
  width: 1rem;
  height: 1rem;
  background: var(--color-accent);
  border: 4px solid var(--color-accent);
  margin: .2rem;
  border-radius: 50%;
  transition: background-color .2s ease-in;
}
.pr-block-carousel__indicator--current {
  background: var(--color-accent-contrast, white);
}
`;

export const CarouselInContext = () => {
  const { config } = useBlock<CarouselConfig>();

  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Carousel {...config} />
    </BaseBlock>
  );
};
CarouselInContext.styles = defaultStyles;

export default CarouselInContext;
