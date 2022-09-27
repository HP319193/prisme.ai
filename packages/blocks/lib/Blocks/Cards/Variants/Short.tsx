import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardProps, CardShort } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import { truncate } from '../../../utils/truncate';
import CarouselNavigation from '../CarouselNavigation';
import ActionOrLink from '../ActionOrLink';
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
                <ActionOrLink action={action}>
                  <div
                    key={index}
                    className={tw`cards-container__card-container card-container flex flex-col
                  snap-start m-[0.625rem] group h-[10rem] rounded-[0.938rem] border border-[rgba(0, 0, 0, 0.20)]
                  min-w-[19.563rem] max-w-[19.563rem] overflow-hidden ${getBgClassName(
                    backgroundColor
                  )}`}
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
                        <RichTextRenderer>
                          {truncate(localize(description), 73)}
                        </RichTextRenderer>
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
