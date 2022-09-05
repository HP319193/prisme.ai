import { RefObject, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardsConfig, CardSquare } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import ScrollElements from '../ScrollElements';
import { truncate } from '../../../utils/truncate';

interface SquareProps extends Omit<CardsConfig, 'cards'> {
  styles: {
    container: string;
  };
  container: RefObject<HTMLDivElement>;
  canScroll: boolean | null;
  scroll: (step: number) => () => void;
  cards: CardSquare[];
}

const Square = ({
  title,
  styles,
  cards,
  container,
  canScroll,
  scroll,
}: SquareProps) => {
  const { localize } = useLocalizedText();
  const { t } = useTranslation();

  const getCoverStyle = useCallback(
    (index: number) => {
      const { cover } = cards[index] || {};
      const isUrl = cover && cover.match(/^http/);
      return {
        background: `linear-gradient(rgba(81, 81, 81, 0), rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.20)), ${
          isUrl ? `url("${cover}")` : 'rgb(54, 54, 54)'
        }`,
      };
    },
    [cards]
  );

  return (
    <div className={tw`block-cards variant-square flex flex-col w-full`}>
      <div
        className={tw`block-cards__title-container title-container pt-8 pl-8`}
      >
        {title && <BlockTitle value={localize(title)} />}
      </div>
      <div
        className={tw`block-cards__cards-container cards-container relative !pt-0 w-full overflow-hidden`}
      >
        <div
          ref={container}
          className={`cards-container__cards-container cards-container ${styles.container}`}
        >
          {(cards as CardSquare[]).map(
            ({ title, description, cover }, index) => (
              <div
                key={index}
                className={`${tw`cards-container__card-container card-container flex flex-col snap-start m-[0.625rem] group max-w-[12.625rem] w-[12.625rem] h-[12.625rem] flex-card`}`}
              >
                <div
                  className={tw`flex flex-grow items-end p-[0.938rem] rounded-[0.625rem] overflow-hidden bg-cover`}
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
            )
          )}
        </div>

        {canScroll && <ScrollElements scroll={scroll} />}
      </div>
    </div>
  );
};

export default Square;
