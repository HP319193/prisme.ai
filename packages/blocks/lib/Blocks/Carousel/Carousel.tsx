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
  }, [autoscrollIsActive, autoscrollSpeed]);

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
        <div className="pr-block-carousel__arrows">
          <div className="pr-block-carousel__arrow pr-block-carousel__arrow--left">
            <Tooltip title={t('cards.prev')} placement="right">
              <button
                onClick={scroll(-1)}
                className="pr-block-carousel__arrow__button"
              >
                {/*
                  'block-cards__scroll__left__button outline-none justify-center items-center'
          */}
                <ArrowLeftOutlined className="pr-block-carousel__arrow__icon" />
                {/*tw`block-cards__scroll__left__button__icon bg-black rounded-[50%]`*/}
              </button>
            </Tooltip>
          </div>
          <div className="pr-block-carousel__arrow pr-block-carousel__arrow--right">
            <Tooltip title={t('cards.next')} placement="left">
              <button
                onClick={scroll(1)}
                className="pr-block-carousel__arrow__button"
              >
                {/*tw`block-cards__scroll__right__button outline-none flex justify-center items-center`*/}
                <ArrowRightOutlined className="pr-block-carousel__arrow__icon" />
                {/*tw`block-cards__scroll__right__button__icon bg-black rounded-[50%]`*/}
              </button>
            </Tooltip>
          </div>
        </div>
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
