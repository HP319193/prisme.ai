import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardArticle, CardProps } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import CarouselNavigation from '../CarouselNavigation';
import ActionOrLink from '../../ActionOrLink';
import Truncated from '../Truncated';
import { RichText } from '../../RichText';

interface ArticleProps extends CardProps<CardArticle[]> {}

const Article = ({
  title,
  styles,
  cards,
  container,
  getCoverStyle,
  canScroll,
  scroll,
  className = '',
}: ArticleProps) => {
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
            {(cards as CardArticle[]).map(
              ({ title, subtitle, tag, description, action }, index) => (
                <ActionOrLink action={action} key={index}>
                  <div
                    key={index}
                    className={tw`cards-container__card-container card-container`}
                  >
                    <div
                      className={tw`flex flex-col
                  m-[0.625rem] group h-[23.188rem] rounded-[0.938rem] border border-[rgba(0,0,0,0.20)]
                  min-w-[19.563rem] max-w-[19.563rem] bg-white
                  group transition-transform hover:translate-y-1 hover:scale-105 shadow-sm hover:shadow-lg`}
                    >
                      {getCoverStyle(index) && (
                        <div
                          className={tw`card-container__card-cover card-cover flex flex-row m-[0.438rem]
                  mb-0 min-h-[10.25rem] h-[10.25rem] rounded-[0.625rem] !bg-cover !bg-center
                  transition-transform group-hover:hover:scale-95`}
                          style={getCoverStyle(index)}
                        >
                          {tag && (
                            <Truncated
                              className={tw`card-cover__card-tag card-tag leading-[1.7] max-h-[2rem] overflow-hidden m-[0.625rem] px-[0.938rem] py-[0.45rem]
                      rounded-[0.938rem] text-[12px] text-white`}
                              style={{
                                backgroundColor: 'rgba(0,0,0, 0.75)',
                              }}
                              text={localize(tag)}
                            >
                              {(truncatedText) => truncatedText}
                            </Truncated>
                          )}
                        </div>
                      )}
                      <div
                        className={tw`space-y-[0.625rem] m-[1.25rem] mb-[0.7rem] overflow-hidden`}
                      >
                        {subtitle && (
                          <Truncated
                            className={tw`text-[0.75rem] leading-[1.2] max-h-[1rem] overflow-hidden`}
                            text={localize(subtitle)}
                          >
                            {(truncatedText) => truncatedText}
                          </Truncated>
                        )}
                        <Truncated
                          className={tw`font-bold text-[1.25rem] leading-[1.2] max-h-[3rem] overflow-hidden`}
                          text={localize(title)}
                        >
                          {(truncatedText) => truncatedText}
                        </Truncated>
                        <Truncated
                          className={tw`text-[0.875rem] leading-[1.2] pb-1 overflow-hidden`}
                          text={localize(description)}
                          ellipsis="…"
                        >
                          {(truncatedText) => (
                            <RichText>{truncatedText || ''}</RichText>
                          )}
                        </Truncated>
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

export default Article;
