import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardAction, CardProps } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import { truncate } from '../../../utils/truncate';
import CarouselNavigation from '../CarouselNavigation';
import CardButton from '../CardButton';

interface ActionsProps extends CardProps<CardAction[]> {}

const getBgClassName = (bgColor: CardAction['backgroundColor']) => {
  switch (bgColor) {
    case 'white':
    case 'transparent-white':
      return tw`text-white bg-[rgba(255,255,255,0.1)]`;
    case 'black':
    case 'transparent-black':
    default:
      return tw`text-black bg-[rgba(0,0,0,0.05)]`;
  }
};

const getBtnClassName = (bgColor: CardAction['backgroundColor']) => {
  switch (bgColor) {
    case 'white':
    case 'transparent-white':
      return tw`text-white border border-solid border-white bg-transparent`;
    case 'black':
    case 'transparent-black':
    default:
      return tw`text-black bg-white`;
  }
};

const Actions = ({
  title,
  styles,
  cards,
  container,
  getCoverStyle,
  canScroll,
  scroll,
  className = '',
}: ActionsProps) => {
  const { localize } = useLocalizedText();

  return (
    <div
      className={tw`block-cards variant-article flex flex-col w-full ${className}`}
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
            {(cards as CardAction[]).map(
              (
                { title, description, cover, content = [], backgroundColor },
                index
              ) => (
                <div
                  key={index}
                  className={tw`cards-container__card-container card-container snap-start`}
                >
                  <div
                    className={tw`flex flex-col
                  m-[0.625rem] group h-[23.188rem] rounded-[0.938rem]
                  min-w-[19.563rem] max-w-[19.563rem] overflow-hidden ${getBgClassName(
                    backgroundColor
                  )}
                  transition-transform hover:translate-y-1 hover:scale-105 shadow-sm hover:shadow-lg`}
                  >
                    <div className={tw`flex flex-row m-[1.25rem]`}>
                      {getCoverStyle(index) && (
                        <div
                          className={tw`card-container__card-cover card-cover flex flex-row
                  mb-0 h-[5.5rem] w-[5.25rem] min-w-[5.25rem] rounded-[0.625rem] !bg-cover !bg-center`}
                          style={getCoverStyle(index)}
                        />
                      )}
                      <div
                        className={tw`flex flex-col space-y-[0.313rem] ml-[1.25rem] justify-center h-[5.5rem]`}
                      >
                        <div className={tw`font-bold text-[1.25rem]`}>
                          {truncate(
                            localize(title),
                            getCoverStyle(index) ? 14 : 25
                          )}
                        </div>
                        <div className={tw`text-[0.875rem]`}>
                          {truncate(
                            localize(description),
                            getCoverStyle(index) ? 43 : 80
                          )}
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
                              className={tw`flex flex-grow rounded-[0.625rem] h-[3.125rem] items-center justify-center `}
                            >
                              <CardButton
                                type="button"
                                url={
                                  item.type === 'url' ? item.value : undefined
                                }
                                event={
                                  item.type === 'event' ? item.value : undefined
                                }
                                payload={item.payload}
                                value={truncate(localize(item.text), 60)}
                                popup={item.popup}
                                className={tw`flex flex-grow rounded-[0.625rem] h-[3.125rem] items-center justify-center text-center font-semibold text-[0.875rem] ${getBtnClassName(
                                  backgroundColor
                                )}`}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
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
