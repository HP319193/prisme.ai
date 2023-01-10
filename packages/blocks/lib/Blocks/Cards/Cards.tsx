import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useBlock } from '../../Provider';
import { withI18nProvider } from '../../i18n';
import tw from '../../tw';
import {
  CardAction,
  CardArticle,
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
import { BlockComponent } from '../../BlockLoader';

const cardsIsShort = (
  cards: TCards,
  variant: CardsConfig['variant']
): cards is CardShort[] => variant === 'short';

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

export const Cards: BlockComponent = () => {
  const {
    config,
    config: { cards = EMPTY_ARRAY } = {} as CardsConfig,
  } = useBlock<CardsConfig>();
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
      !config.layout ||
      !config.layout.type ||
      config.layout.type !== 'carousel' ||
      !config.layout.autoScroll ||
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
      (!config.layout ||
        !config.layout.type ||
        config.layout.type === 'carousel') &&
        container.current &&
        container.current.scrollWidth >
          container.current.getBoundingClientRect().width
    );
  }, [config.layout, cards]);

  const styles = useMemo(() => {
    const { layout: { type = 'carousel' } = {} } = config;
    return getContainerStyle(type);
  }, [config]);

  const getCoverStyle = useCallback(
    (index: number) => {
      if (cardsIsShort(cards, config.variant)) return;

      const cover = (cards[index] || {}).cover;

      return {
        background: `${
          cover
            ? `url("${cover}")`
            : 'linear-gradient(rgba(81, 81, 81, 0), rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.20)), rgb(140, 140, 140)'
        }`,
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
    ...config,
  };

  const filteredCards = useMemo(() => (cards as []).filter(Boolean), [cards]);

  switch (config.variant) {
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
Cards.Preview = ({ config = {} }) => {
  const type: CardsConfig['layout']['type'] =
    config?.layout?.type || 'carousel';

  return (
    <div>
      {config.title && <div>{config.title}</div>}
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

export default withI18nProvider(Cards);
