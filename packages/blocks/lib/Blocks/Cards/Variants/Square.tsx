import { useCallback } from 'react';
import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardProps, CardSquare } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import CarouselNavigation from '../CarouselNavigation';
import { truncate } from '../../../utils/truncate';
import ActionOrLink from '../ActionOrLink';

interface SquareProps extends CardProps<CardSquare[]> {}

const Square = ({
  title,
  styles,
  cards,
  container,
  canScroll,
  scroll,
}: SquareProps) => {
  const { localize } = useLocalizedText();

  const getCoverStyle = useCallback(
    (index: number) => {
      const { cover } = cards[index] || {};
      return {
        background: `linear-gradient(rgba(81, 81, 81, 0), rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), ${
          cover ? `url("${cover}")` : 'rgb(140, 140, 140)'
        }`,
      };
    },
    [cards]
  );

  return (
    <div className={tw`block-cards variant-square flex flex-col w-full`}>
      {title && <BlockTitle value={localize(title)} />}
      <div
        className={tw`block-cards__cards-container cards-container relative !pt-0 w-full overflow-hidden`}
      >
        <CarouselNavigation
          scroll={scroll}
          scrollable={canScroll}
          scrollableRef={container}
        >
          <div
            ref={container}
            className={`cards-container__cards-container cards-container ${styles.container}`}
          >
            {(cards as CardSquare[]).map(
              ({ title, description, cover, action }, index) => (
                <ActionOrLink action={action}>
                  <div
                    key={index}
                    className={`${tw`cards-container__card-container card-container flex flex-col snap-start m-[0.625rem] group max-w-[12.625rem] w-[12.625rem] h-[12.625rem] flex-card`}`}
                  >
                    <div
                      className={tw`flex flex-grow items-end p-[0.938rem] rounded-[0.625rem] overflow-hidden !bg-cover`}
                      style={getCoverStyle(index)}
                    >
                      <div className={tw`flex flex-col text-white`}>
                        <div className={tw`font-bold text-[1.25rem]`}>
                          {truncate(localize(title), 25)}
                        </div>
                        <div className={tw`text-[0.875rem]`}>
                          {truncate(localize(description), 65)}
                        </div>
                      </div>
                    </div>
                  </div>
                </ActionOrLink>
              )
            )}
          </div>
        </CarouselNavigation>
      </div>
    </div>
  );
};

export default Square;
