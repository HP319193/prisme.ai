import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardProps, CardShort } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import CarouselNavigation from '../CarouselNavigation';
import ActionOrLink from '../../ActionOrLink';
import Truncated from '../Truncated';
import { RichTextRenderer } from '../../RichText';

interface ShortProps extends CardProps<CardShort[]> {}

const getBgClassName = (bgColor: CardShort['backgroundColor']) => {
  switch (bgColor) {
    case 'transparent-black':
      return tw`bg-transparent text-black border-[1px] border-[rgba(0,0,0,0.2)]`;
    case 'transparent-white':
      return tw`bg-transparent text-white border-[1px] border-[rgba(255,255,255,0.2)]`;
    case 'white':
      return tw`bg-white text-black`;
    case 'black':
    default:
      return tw`bg-black text-white border-[1px] border-black`;
  }
};

const Short = ({
  title,
  styles,
  cards,
  container,
  canScroll,
  scroll,
}: ShortProps) => {
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
            {(cards as CardShort[]).map(
              (
                { title, subtitle, description, backgroundColor, action },
                index
              ) => (
                <ActionOrLink action={action} key={index}>
                  <div
                    className={tw`cards-container__card-container card-container snap-start`}
                  >
                    <div
                      className={tw`flex flex-col
                   m-[0.625rem] group h-[10rem] rounded-[0.938rem] border border-[rgba(0,0,0,0.20)]
                  min-w-[19.563rem] max-w-[19.563rem] overflow-hidden ${getBgClassName(
                    backgroundColor
                  )}
                  transition-transform hover:translate-y-1 hover:scale-105 shadow-sm hover:shadow-lg`}
                    >
                      <div className={tw`space-y-[0.625rem] m-[1.25rem]`}>
                        {subtitle && (
                          <Truncated
                            className={tw`text-[0.75rem] leading-[1.2] max-h-[1rem] overflow-hidden`}
                          >
                            {localize(subtitle)}
                          </Truncated>
                        )}
                        <Truncated
                          className={tw`font-bold text-[0.875rem] leading-[1.2] max-h-[2rem] overflow-hidden`}
                        >
                          {localize(title)}
                        </Truncated>
                        <Truncated
                          className={tw`text-[0.875rem] leading-[1.2] max-h-[4.2rem] overflow-hidden`}
                          ellipsis="…"
                        >
                          <RichTextRenderer>
                            {description || ''}
                          </RichTextRenderer>
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

export default Short;
