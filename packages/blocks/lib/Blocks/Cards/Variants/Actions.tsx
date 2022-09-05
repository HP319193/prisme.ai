import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardAction, CardsConfig } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import { truncate } from '../../../utils/truncate';
import ScrollElements from '../ScrollElements';
import { useBlocks } from '../../../Provider/blocksContext';

interface ActionsProps extends Omit<CardsConfig, 'cards'> {
  styles: {
    container: string;
  };
  container: RefObject<HTMLDivElement>;
  getCoverStyle: (index: number) => any;
  canScroll: boolean | null;
  scroll: (step: number) => () => void;
  cards: CardAction[];
}

const Actions = ({
  title,
  styles,
  cards,
  container,
  getCoverStyle,
  canScroll,
  scroll,
}: ActionsProps) => {
  const { localize } = useLocalizedText();
  const { t } = useTranslation();
  const {
    components: { Link },
  } = useBlocks();

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
          {(cards as CardAction[]).map(
            ({ title, description, cover, content = [] }, index) => (
              <div
                key={index}
                className={`${tw`cards-container__card-container card-container flex flex-col
                  snap-start m-[0.625rem] group h-[23.188rem] rounded-[0.938rem]
                  min-w-[19.563rem] max-w-[19.563rem] bg-white overflow-hidden background-actions`}`}
              >
                <div className={tw`flex flex-row m-[1.25rem]`}>
                  <div
                    className={tw`card-container__card-cover card-cover flex flex-row
                  mb-0 h-[5.5rem] w-[5.25rem] min-w-[5.25rem] rounded-[0.625rem] bg-cover`}
                    style={getCoverStyle(index)}
                  />
                  <div
                    className={tw`flex flex-col space-y-[0.313rem] ml-[1.25rem] justify-center`}
                  >
                    <div className={tw`font-bold text-[1.25rem]`}>
                      {truncate(localize(title), 14)}
                    </div>
                    <div className={tw`text-[0.875rem]`}>
                      {truncate(localize(description), 43)}
                    </div>
                  </div>
                </div>
                <div
                  className={tw`flex flex-col flex-grow justify-center items-center`}
                >
                  {content &&
                    Array.isArray(content) &&
                    (content.length > 3 ? content.slice(2) : content).map(
                      (item, index) => (
                        <div
                          key={index}
                          className={`${tw`card__card-content-outer card-content-outer flex w-full py-[0.625rem] px-[1.25rem] font-semibold`}`}
                        >
                          <div
                            className={tw`flex flex-grow bg-white rounded-[0.625rem] h-[3.125rem] items-center justify-center `}
                          >
                            {truncate(localize(item.text), 20)}
                            {/*{item.type === 'button' && <CardButton {...item} />}*/}
                          </div>
                        </div>
                      )
                    )}
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

export default Actions;
