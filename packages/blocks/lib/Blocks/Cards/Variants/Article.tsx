import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardArticle, CardProps } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import { truncate } from '../../../utils/truncate';
import CarouselNavigation from '../CarouselNavigation';

interface ArticleProps extends CardProps<CardArticle[]> {}

const Article = ({
  title,
  styles,
  cards,
  container,
  getCoverStyle,
  canScroll,
  scroll,
}: ArticleProps) => {
  const { localize } = useLocalizedText();

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
        <CarouselNavigation
          scroll={scroll}
          scrollable={canScroll}
          scrollableRef={container}
        >
          <div
            ref={container}
            className={`cards-container__cards-container cards-container ${styles.container}`}
          >
            {(cards as CardArticle[]).map(
              ({ title, subtitle, tag, description }, index) => (
                <div
                  key={index}
                  className={tw`cards-container__card-container card-container flex flex-col
                  snap-start m-[0.625rem] group h-[23.188rem] rounded-[0.938rem] border border-[rgba(0, 0, 0, 0.20)]
                  min-w-[19.563rem] max-w-[19.563rem] bg-white overflow-hidden`}
                >
                  <div
                    className={tw`card-container__card-cover card-cover flex flex-row m-[0.438rem]
                  mb-0 min-h-[10.25rem] h-[10.25rem] rounded-[0.625rem] bg-cover`}
                    style={getCoverStyle(index)}
                  >
                    {tag && (
                      <div
                        className={tw`card-cover__card-tag card-tag max-h-[2rem] m-[0.625rem] px-[0.938rem] py-[0.45rem]
                      rounded-[0.938rem] text-[12px] text-white`}
                        style={{
                          backgroundColor: 'rgba(0,0,0, 0.75)',
                        }}
                      >
                        {truncate(localize(tag), 25)}
                      </div>
                    )}
                  </div>
                  <div className={tw`space-y-[0.625rem] m-[1.25rem]`}>
                    {subtitle && (
                      <div className={tw`text-[0.75rem]`}>
                        {truncate(localize(subtitle), 40)}
                      </div>
                    )}
                    <div className={tw`font-bold text-[1.25rem]`}>
                      {truncate(localize(title), 40)}
                    </div>
                    <div className={tw`text-[0.875rem]`}>
                      {truncate(localize(description), 110)}
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

export default Article;
