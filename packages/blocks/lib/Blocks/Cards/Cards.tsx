import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const getComponent = (variant: CardsConfig['variant']) => {
  switch (variant) {
    case 'square':
      return Square;
    case 'article':
      return Article;
    case 'short':
      return Short;
    case 'actions':
      return Actions;
    case 'classic':
    default:
      return Classic;
  }
};
const typeCards = (variant: CardsConfig['variant'], cards: TCards) => {
  switch (variant) {
    case 'square':
      return cards as CardSquare[];
    case 'article':
      return cards as CardArticle[];
    case 'short':
      return cards as CardShort[];
    case 'actions':
      return cards as CardAction[];
    case 'classic':
    default:
      return cards as CardClassic[];
  }
};

const cardsIsShort = (
  cards: TCards,
  variant: CardsConfig['variant']
): cards is CardShort[] => variant === 'short';

export const Cards = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();
  const { config = {} as CardsConfig } = useBlock<CardsConfig>();
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

  useEffect(
    () =>
      setCanScroll(
        (!config.layout ||
          !config.layout.type ||
          config.layout.type === 'carousel') &&
          container.current &&
          container.current.scrollWidth >
            container.current.getBoundingClientRect().width
      ),
    [config.layout]
  );

  const styles = useMemo(() => {
    const { layout: { type = 'carousel' } = {} } = config;
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
          container: tw`flex flex-row flex-nowrap overflow-auto no-scrollbar pr-[100vw] snap-x snap-mandatory pb-6`,
        };
    }
  }, [config]);

  const preview = !!(!config.cards && edit);
  const previewText = t('preview');
  const cards = useMemo(
    () =>
      (Array.isArray(config.cards) && config.cards) ||
      (preview
        ? Array.from(
            new Array(6),
            (v) =>
              ({
                title: previewText,
                description: previewText,
                content: [
                  {
                    type: 'text',
                    value: previewText,
                  },
                  {
                    type: 'button',
                    value: previewText,
                  },
                  {
                    type: 'accordion',
                    title: previewText,
                    content: previewText,
                  },
                ],
              } as CardClassic)
          )
        : []),
    [config.cards, preview, previewText]
  );

  const getCoverStyle = useCallback(
    (index: number) => {
      const currentCards = cards;

      if (cardsIsShort(currentCards, config.variant)) return;

      const cover = (currentCards[index] || {}).cover;
      const isUrl = cover && cover.match(/^http/);

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

  const Component = getComponent(config.variant);

  return (
    <Component
      styles={styles}
      container={container}
      canScroll={canScroll}
      scroll={scroll}
      {...config}
      cards={typeCards(config.variant, cards)}
      getCoverStyle={getCoverStyle}
    />
  );
};

export default withI18nProvider(Cards);
