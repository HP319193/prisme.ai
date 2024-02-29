import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardClassic, CardProps } from '../types';
import CardButton from '../CardButton';
import Accordion from '../Accordion';
import { RichText } from '../../RichText';
import useLocalizedText from '../../../useLocalizedText';
import CarouselNavigation from '../CarouselNavigation';

interface ClassicProps extends CardProps<CardClassic[]> {}

const Classic = ({
  title,
  styles,
  cards,
  container,
  getCoverStyle,
  canScroll,
  scroll,
  className = '',
}: ClassicProps) => {
  const { localize } = useLocalizedText();

  return (
    <div
      className={tw`block-cards variant-classic flex flex-col w-full ${className}`}
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
            {(cards as CardClassic[]).map(
              ({ title, description, cover, content = [] }, index) => (
                <div
                  key={index}
                  className={`${tw`cards-container__card-container card-container flex flex-col my-6 pl-[10px] group w-[15rem] min-h-[23rem] flex-card`}`}
                >
                  <div
                    className={`${tw`card-container__card card relative flex flex-1 flex-col mx-2 rounded-[20px] `}`}
                  >
                    <div
                      className={tw`card__card-image card-image h-[10rem] p-[-1px] rounded-[15px] absolute top-0 left-0 right-0 bg-no-repeat bg-contain bg-top`}
                      style={getCoverStyle(index)}
                    />
                    <div
                      className={tw`
                      card__card-content card-content
                      relative flex flex-col min-h-[203px] mt-[103px]
                      rounded-[15px] p-[1.375rem] border-[1px] border-gray-200
                      bg-white
                      transition-transform
                      hover:translate-y-3 hover:scale-105 shadow-sm hover:shadow-lg
                      text-[0.938rem]
                      `}
                    >
                      <div
                        className={`${tw`card__card-title card-content font-bold text-sm text-accent text-center`}`}
                      >
                        {localize(title)}
                      </div>
                      <div
                        className={`${tw`card__card-description card-description text-[10px] my-2 text-neutral-500 text-center`}`}
                      >
                        <RichText>{description || ''}</RichText>
                      </div>
                      {content &&
                        Array.isArray(content) &&
                        content.map((item, index) => (
                          <div
                            key={index}
                            className={`${tw`card__card-content-outer card-content-outer flex mb-4 text-[0.625rem]`}`}
                          >
                            {item.type === 'text' && (
                              <div className="card-content-outer__content-text content-text">
                                <div
                                  className="content-text__content content"
                                  dangerouslySetInnerHTML={{
                                    __html: localize(item.value),
                                  }}
                                />
                              </div>
                            )}
                            {item.type === 'button' && <CardButton {...item} />}
                            {item.type === 'accordion' && (
                              <div
                                className={`${tw`card-content-outer__accordion accordion flex flex-1 border-[1px] border-neutral-200 rounded p-2 max-w-full`}`}
                              >
                                <Accordion
                                  title={
                                    <div
                                      className={tw`accordion__accordion-title accordion-title flex flex-row items-center`}
                                    >
                                      {item.icon && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={item.icon}
                                          alt={localize(item.title)}
                                          width={16}
                                          height={16}
                                          className={tw`accordion-title__image image`}
                                        />
                                      )}{' '}
                                      {localize(item.title)}
                                    </div>
                                  }
                                  collapsed={item.collapsed}
                                >
                                  <div
                                    className={
                                      'accordion-content-container__content content'
                                    }
                                  >
                                    <RichText>
                                      {localize(item.content)}
                                    </RichText>
                                  </div>
                                </Accordion>
                              </div>
                            )}
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

export default Classic;
