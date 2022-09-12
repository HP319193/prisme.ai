import tw from '../../tw';
import { Tooltip } from '@prisme.ai/design-system';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import React, { RefObject, useEffect, useState } from 'react';

interface CarouselNavigationProps {
  scrollable: boolean | null;
  scroll: (step: number) => () => void;
  children: React.ReactElement;
  scrollableRef: RefObject<HTMLDivElement>;
}

const CarouselNavigation = ({
  scrollable,
  scroll,
  children,
  scrollableRef,
}: CarouselNavigationProps) => {
  const { t } = useTranslation();
  const [displayedArrows, setDisplayedArrows] = useState({
    left: false,
    right: true,
  });

  useEffect(() => {
    scrollableRef?.current?.addEventListener('scroll', () => {
      if (!scrollableRef?.current?.scrollLeft) return;
      if (scrollableRef.current.scrollLeft > 100) {
        setDisplayedArrows({ ...displayedArrows, left: true });
      } else {
        setDisplayedArrows({ ...displayedArrows, left: false });
      }
    });
  }, []);

  return (
    <>
      {children}
      {scrollable && (
        <div className={`${tw`block-cards__scroll text-white text-l`}`}>
          <div
            className={tw`block-cards__scroll__left absolute flex justify-center top-16 left-6 h-8 w-8 bg-black rounded-[100%] shadow-lg transition-all ${
              displayedArrows.left ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Tooltip title={t('cards.prev')} placement="right">
              <button
                onClick={scroll(-1)}
                className={
                  'block-cards__scroll__left__button outline-none justify-center items-center'
                }
              >
                <ArrowLeftOutlined
                  className={tw`block-cards__scroll__left__button__icon bg-black rounded-[50%]`}
                />
              </button>
            </Tooltip>
          </div>
          <div
            className={tw`block-cards__scroll__right absolute flex justify-center top-16 right-6 h-8 w-8 bg-black rounded-[100%] shadow-lg`}
          >
            <Tooltip title={t('cards.next')} placement="left">
              <button
                onClick={scroll(1)}
                className={tw`block-cards__scroll__right__button outline-none flex justify-center items-center`}
              >
                <ArrowRightOutlined
                  className={tw`block-cards__scroll__right__button__icon bg-black rounded-[50%]`}
                />
              </button>
            </Tooltip>
          </div>
        </div>
      )}
    </>
  );
};

export default CarouselNavigation;
