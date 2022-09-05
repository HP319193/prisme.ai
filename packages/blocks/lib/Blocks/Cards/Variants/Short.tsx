import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardsConfig, CardShort } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import { truncate } from '../../../utils/truncate';
import ScrollElements from '../ScrollElements';

interface ShortProps extends Omit<CardsConfig, 'cards'> {
  styles: {
    container: string;
  };
  container: RefObject<HTMLDivElement>;
  getCoverStyle: (index: number) => any;
  canScroll: boolean | null;
  scroll: (step: number) => () => void;
  cards: CardShort[];
}

const Short = ({
  title,
  styles,
  cards,
  container,
  getCoverStyle,
  canScroll,
  scroll,
}: ShortProps) => {
  const { localize } = useLocalizedText();
  const { t } = useTranslation();

  return (
    <div className={tw`block-cards variant-article flex flex-col w-full`}>
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
          {(cards as CardShort[]).map(
            ({ title, subtitle, description, backgroundColor }, index) => (
              <div
                key={index}
                className={`${tw`cards-container__card-container card-container flex flex-col
                  snap-start m-[0.625rem] group h-[10rem] rounded-[0.938rem] border border-[rgba(0, 0, 0, 0.20)]
                  min-w-[19.563rem] max-w-[19.563rem] bg-white overflow-hidden backgroundColor-${backgroundColor}`}`}
              >
                <div className={tw`space-y-[0.625rem] m-[1.25rem]`}>
                  {subtitle && (
                    <div className={tw`text-[0.75rem]`}>
                      {truncate(localize(subtitle), 40)}
                    </div>
                  )}
                  <div className={tw`font-bold text-[0.875rem]`}>
                    {truncate(localize(title), 60)}
                  </div>
                  <div className={tw`text-[0.875rem]`}>
                    {truncate(localize(description), 73)}
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

export default Short;
