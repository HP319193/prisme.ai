import { useCallback } from 'react';
import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardProps, CardSquare } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import CarouselNavigation from '../CarouselNavigation';
import ActionOrLink from '../../ActionOrLink';
import Truncated from '../Truncated';
import { RichText } from '../../RichText';

interface SquareProps extends CardProps<CardSquare[]> {}

const Square = ({
  title,
  styles,
  cards,
  container,
  canScroll,
  scroll,
  className = '',
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
    <div
      className={tw`block-cards variant-square flex flex-col w-full ${className}`}
    >
      {title && <BlockTitle value={localize(title)} />}
      <div
        className={tw`block-cards__cards-container cards-container relative !pt-0 w-full`}
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
              ({ title, description, action }, index) => (
                <ActionOrLink action={action} key={index}>
                  <div
                    className={tw`cards-container__card-container card-container snap-start flex-card`}
                  >
                    <div
                      className={tw`flex flex-col m-[0.625rem] group max-w-[12.625rem] w-[12.625rem] h-[12.625rem] transition-transform hover:translate-y-1 hover:scale-105 shadow-sm hover:shadow-lg`}
                    >
                      <div
                        className={tw`flex flex-grow items-end p-[0.938rem] rounded-[0.625rem] overflow-hidden !bg-cover !bg-center`}
                        style={getCoverStyle(index)}
                      >
                        <div className={tw`flex flex-col text-white`}>
                          <Truncated
                            className={tw`font-bold text-[1.25rem] mb-2 leading-[1.2] max-h-[4.6rem] overflow-hidden`}
                          >
                            {localize(title)}
                          </Truncated>
                          <Truncated
                            className={tw`text-[0.875rem] leading-[1.2] max-h-[4.2rem] overflow-hidden`}
                            ellipsis="…"
                          >
                            <RichText>{description || ''}</RichText>
                          </Truncated>
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
