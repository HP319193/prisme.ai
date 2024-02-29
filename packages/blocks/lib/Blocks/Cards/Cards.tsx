import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useBlock } from '../../Provider';
import tw from '../../tw';
import {
  CardAction,
  CardArticle,
  CardBlocks,
  CardClassic,
  Cards as TCards,
  CardsConfig,
  CardShort,
  CardSquare,
} from './types';
import Classic from './Variants/Classic';
import Square from './Variants/Square';
import Article from './Variants/Article';
import Short from './Variants/Short';
import Actions from './Variants/Actions';
import useLocalizedText from '../../useLocalizedText';
import Blocks from './Variants/Blocks';
import { BaseBlock } from '../BaseBlock';

const cardsIsShort = (
  cards: TCards,
  variant: CardsConfig['variant']
): cards is CardShort[] => variant === 'short';
const cardsIsBlocks = (
  cards: TCards,
  variant: CardsConfig['variant']
): cards is CardBlocks[] => variant === 'blocks';

const getContainerStyle = (type: CardsConfig['layout']['type']) => {
  switch (type) {
    case 'grid':
      return {
        container: tw`flex flex-row flex-wrap justify-center`,
      };
    case 'column':
      return {
        container: tw`flex flex-wrap flex-col items-center`,
      };
    case 'carousel':
    default:
      return {
        container: tw`flex flex-row flex-nowrap overflow-auto no-scrollbar snap-x snap-mandatory pb-6`,
      };
  }
};

const EMPTY_ARRAY: CardsConfig['cards'] = [];

export const Cards = ({
  cards = EMPTY_ARRAY,
  layout,
  variant,
  className,
  ...config
}: CardsConfig) => {
  const [canScroll, setCanScroll] = useState<boolean | null>(false);

  const container = useRef<HTMLDivElement>(null);

  const scroll = useCallback(
    (step: number) => () => {
      if (!container.current) return;
      const { current } = container;
      const currentLeft = current.scrollLeft;
      const cardWidth = current.firstChild
        ? (current.firstChild as Element).getBoundingClientRect().width
        : 1;

      setTimeout(() => {
        if (currentLeft === current.scrollLeft) {
          const from = current.scrollLeft;
          current.scrollBy({
            left: step * cardWidth,
            top: 0,
            behavior: 'smooth',
          });
          setTimeout(() => {
            if (from !== current.scrollLeft) return;
            // Go back to the start or the the end
            current.scrollTo({
              left: from === 0 ? current.scrollWidth : 0,
              top: 0,
              behavior: 'smooth',
            });
          }, 50);
        }
      }, 50);
    },
    []
  );

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          return scroll(-1)();
        case 'ArrowRight':
          return scroll(1)();
      }
    };
    document.body.addEventListener('keydown', listener);

    return () => {
      document.body.removeEventListener('keydown', listener);
    };
  }, [scroll]);

  useEffect(() => {
    if (
      !layout ||
      !layout.type ||
      layout.type !== 'carousel' ||
      !layout.autoScroll ||
      !container.current
    )
      return;
    const { current } = container;
    const interval = setInterval(() => {
      scroll(current.getBoundingClientRect().width)();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  });

  useLayoutEffect(() => {
    setCanScroll(
      (!layout || !layout.type || layout.type === 'carousel') &&
        container.current &&
        container.current.scrollWidth >
          container.current.getBoundingClientRect().width
    );
  }, [layout, cards]);

  const styles = useMemo(() => {
    const { type = 'carousel' } = layout || {};
    return getContainerStyle(type);
  }, [layout]);

  const getCoverStyle = useCallback(
    (index: number) => {
      if (cardsIsShort(cards, variant) || cardsIsBlocks(cards, variant))
        return null;

      const cover = (cards[index] || {}).cover;

      if (!cover) return null;

      return {
        background: `url("${cover}")`,
      };
    },
    [cards]
  );

  const cardsProps = {
    styles,
    container,
    canScroll,
    scroll,
    getCoverStyle,
    layout,
    variant,
    className,
    ...config,
  };

  const filteredCards = useMemo(() => (cards as []).filter(Boolean), [cards]);

  switch (variant) {
    case 'square':
      return (
        <Square {...cardsProps} cards={(filteredCards as CardSquare[]) || []} />
      );
    case 'article':
      return (
        <Article
          {...cardsProps}
          cards={(filteredCards as CardArticle[]) || []}
        />
      );
    case 'short':
      return (
        <Short {...cardsProps} cards={(filteredCards as CardShort[]) || []} />
      );
    case 'actions':
      return (
        <Actions
          {...cardsProps}
          cards={(filteredCards as CardAction[]) || []}
        />
      );
    case 'blocks':
      return (
        <Blocks {...cardsProps} cards={(filteredCards as CardBlocks[]) || []} />
      );
    case 'classic':
    default:
      return (
        <Classic
          {...cardsProps}
          cards={(filteredCards as CardClassic[]) || []}
        />
      );
  }
};

const previews = Array.from(new Array(4), (v, k) => k);
Cards.Preview = ({ config }: { config: CardsConfig }) => {
  const { localize } = useLocalizedText();
  const type: CardsConfig['layout']['type'] =
    config?.layout?.type || 'carousel';

  const title = localize(config.title);

  return (
    <div>
      {title && <div>{title}</div>}
      <div className={getContainerStyle(type).container}>
        {previews.map((k) => (
          <div
            key={k}
            className={tw`flex snap-start m-2 w-[10rem] h-[10rem] flex-card bg-gray rounded`}
          />
        ))}
      </div>
    </div>
  );
};

const defaultStyles = `
.pr-block-data-table__table-container {
  overflow: auto;
}

:block .cards-container {
  scroll-snap-align: start;
}
`;

export const CardsInContext = () => {
  const { config } = useBlock<CardsConfig>();
  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Cards {...config} />
    </BaseBlock>
  );
};

export default CardsInContext;
