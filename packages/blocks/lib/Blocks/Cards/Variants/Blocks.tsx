import tw from '../../../tw';
import BlockTitle from '../../Internal/BlockTitle';
import { CardBlocks, CardProps } from '../types';
import useLocalizedText from '../../../useLocalizedText';
import CarouselNavigation from '../CarouselNavigation';
import { BlocksList } from '../../BlocksList';

interface BlocksProps extends CardProps<CardBlocks[]> {}

const Blocks = ({
  title,
  styles,
  cards,
  container,
  canScroll,
  scroll,
  className = '',
}: BlocksProps) => {
  const { localize } = useLocalizedText();

  return (
    <div
      className={tw`pr-block-cards block-cards variant-article flex flex-col w-full ${className}`}
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
            {(cards as CardBlocks[]).map(({ content }, index) => (
              <div
                key={index}
                className={tw`pr-block-cards__card cards-container__card-container card-container`}
              >
                <BlocksList {...content} />
              </div>
            ))}
          </div>
        </CarouselNavigation>
      </div>
    </div>
  );
};

export default Blocks;
