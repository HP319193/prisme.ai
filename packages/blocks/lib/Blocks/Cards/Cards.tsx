import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBlock } from '../../Provider';
import { withI18nProvider } from '../../i18n';
import tw from '../../tw';
import {
  CardAction,
  CardArticle,
  CardClassic,
  CardsConfig,
  CardShort,
  CardSquare,
  CardsType,
} from './types';
import Classic from './Variants/Classic';
import Square from './Variants/Square';
import Article from './Variants/Article';
import Short from './Variants/Short';
import Actions from './Variants/Actions';

const cardsIsShort = (
  cards: CardsType,
  variant: CardsConfig['variant']
): cards is CardShort[] => variant === 'short';

export const Cards = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();
  const { config = {} as CardsConfig } = useBlock<CardsConfig>();
  const [canScroll, setCanScroll] = useState<boolean | null>(false);

  const container = useRef<HTMLDivElement>(null);

  const colors = useRef<string[]>([]);

  const getRandomColor = useCallback((index: number) => {
    if (!colors.current[index]) {
      colors.current[index] = (Math.random() * Math.random() * 1000000000)
        .toString(16)
        .substring(0, 6);
    }

    return `#${colors.current[index]}`;
  }, []);

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
          container: tw`flex flex-row flex-nowrap overflow-auto pr-[100vw] snap-x snap-mandatory pb-6`,
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
          isUrl
            ? `url(${cover})`
            : 'linear-gradient(rgba(81, 81, 81, 0), rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.20)), rgb(54, 54, 54)'
        }`,
      };
    },
    [cards]
  );

  switch (config.variant) {
    case 'square':
      return (
        <Square
          styles={styles}
          container={container}
          canScroll={canScroll}
          scroll={scroll}
          {...config}
          cards={cards as CardSquare[]}
        />
      );
    case 'article':
      return (
        <Article
          styles={styles}
          container={container}
          getCoverStyle={getCoverStyle}
          canScroll={canScroll}
          scroll={scroll}
          {...config}
          cards={cards as CardArticle[]}
        />
      );
    case 'short':
      return (
        <Short
          styles={styles}
          container={container}
          getCoverStyle={getCoverStyle}
          canScroll={canScroll}
          scroll={scroll}
          {...config}
          cards={cards as CardShort[]}
        />
      );
    case 'actions':
      return (
        <Actions
          styles={styles}
          container={container}
          getCoverStyle={getCoverStyle}
          canScroll={canScroll}
          scroll={scroll}
          {...config}
          cards={cards as CardAction[]}
        />
      );
    case 'classic':
    default:
      return (
        <Classic
          styles={styles}
          container={container}
          getCoverStyle={getCoverStyle}
          canScroll={canScroll}
          scroll={scroll}
          {...config}
          cards={cards as CardClassic[]}
        />
      );
  }
};

export default withI18nProvider(Cards);
