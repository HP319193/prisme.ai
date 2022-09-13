import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardAction, CardProps } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import { truncate } from '../../../utils/truncate';
import CarouselNavigation from '../CarouselNavigation';
import CardButton from '../CardButton';

interface ActionsProps extends CardProps<CardAction[]> {}

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

  return (
    <div className={tw`block-cards variant-article flex flex-col w-full`}>
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
            {(cards as CardAction[]).map(
              ({ title, description, cover, content = [] }, index) => (
                <div
                  key={index}
                  className={`${tw`cards-container__card-container card-container flex flex-col
                  snap-start m-[0.625rem] group h-[23.188rem] rounded-[0.938rem]
                  min-w-[19.563rem] max-w-[19.563rem] bg-[rgba(0,0,0,0.05)] overflow-hidden background-actions`}`}
                >
                  <div className={tw`flex flex-row m-[1.25rem]`}>
                    <div
                      className={tw`card-container__card-cover card-cover flex flex-row
                  mb-0 h-[5.5rem] w-[5.25rem] min-w-[5.25rem] rounded-[0.625rem] !bg-cover`}
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
                      content.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className={`${tw`card__card-content-outer card-content-outer flex w-full py-[0.625rem] px-[1.25rem] font-semibold`}`}
                        >
                          <div
                            className={tw`flex flex-grow bg-white rounded-[0.625rem] h-[3.125rem] items-center justify-center `}
                          >
                            <CardButton
                              type="button"
                              url={item.type === 'url' ? item.value : undefined}
                              event={
                                item.type === 'event' ? item.value : undefined
                              }
                              payload={item.payload}
                              value={truncate(localize(item.text), 20)}
                              popup={item.popup}
                              className={tw`flex flex-grow bg-white rounded-[0.625rem] h-[3.125rem] items-center justify-center font-semibold text-[0.875rem]`}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            )}
          </div>
        </CarouselNavigation>
      </div>
    </div>
  );
};

export default Actions;
