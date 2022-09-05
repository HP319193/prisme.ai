import {
  DownOutlined,
  LeftOutlined,
  LinkOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { StretchContent, Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'react-i18next';
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import BlockTitle from '../Internal/BlockTitle';
import { useBlock } from '../../Provider';
import useLocalizedText from '../../useLocalizedText';
import { withI18nProvider } from '../../i18n';
import { useBlocks } from '../../Provider/blocksContext';
import { RichTextRenderer } from '../RichText';
import tw from '../../tw';

interface CardButton {
  type: 'button';
  value: Prismeai.LocalizedText;
  url?: Prismeai.LocalizedText;
  popup?: boolean;
  event?: string;
  payload?: any;
  icon?: string;
}

interface Card {
  title?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  cover?: string;
  content?: (
    | {
        type: 'text';
        value: Prismeai.LocalizedText;
      }
    | CardButton
    | {
        type: 'accordion';
        title: Prismeai.LocalizedText;
        content: Prismeai.LocalizedText;
        icon?: string;
      }
  )[];
}

interface CardsConfig {
  title: Prismeai.LocalizedText;
  cards: Card[];
  type: 'classic' | 'square' | 'withButtons';
  layout: {
    type: 'grid' | 'column' | 'carousel';
    autoScroll?: boolean;
  };
}

const Accordion: FC<{
  title: ReactNode;
}> = ({ title, children }) => {
  const [visible, setVisible] = useState(false);
  const {
    components: { DownIcon },
  } = useBlocks();

  return (
    <div className={tw`accordion__container container flex flex-1 flex-col`}>
      <button
        className={tw`container__button button flex flex-1 justify-between items-center p-1`}
        onClick={() => setVisible(!visible)}
      >
        {title}
        {DownIcon ? (
          <DownIcon />
        ) : (
          <DownOutlined
            className={tw`button__icon icon transition-transform ${
              visible ? '-rotate-180' : ''
            }`}
          />
        )}
      </button>
      <StretchContent visible={visible}>
        <div
          className={tw`container__accordion-content-container accordion-content-container p-2`}
        >
          {children}
        </div>
      </StretchContent>
    </div>
  );
};

const CardButton: FC<CardButton> = ({
  url,
  popup,
  event,
  icon,
  value,
  payload,
}) => {
  const { localize } = useLocalizedText();
  const { events } = useBlock();
  const {
    components: { Link },
  } = useBlocks();

  if (url) {
    return (
      <Link
        className={`${tw`card-content-outer__button-link button-link flex flex-1 flex-row bg-[#E6EFFF] text-[10px] text-accent p-4 rounded text-left`}`}
        href={url}
        target={popup ? '_blank' : undefined}
      >
        <div
          className={tw`button-link__image-container image-container flex mr-2`}
        >
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="image-container__image image image-container__image--custom image--custom"
              src={icon}
              alt={localize(value)}
              height={16}
              width={16}
            />
          ) : (
            <LinkOutlined
              className="image-container__image image image-container__image--default image--default"
              height={16}
              width={16}
            />
          )}
        </div>
        <RichTextRenderer>{localize(value)}</RichTextRenderer>
      </Link>
    );
  }
  if (event) {
    return (
      <button
        type="button"
        className={`${tw`block-cards__button-event button-event flex flex-1 flex-row bg-[#E6EFFF] text-[10px] text-accent p-4 rounded text-left`}`}
        onClick={() => events?.emit(event, payload)}
      >
        <div
          className={tw`button-event__image-container image-container flex mr-2`}
        >
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="image-container__image--custom image--custom"
              src={icon}
              alt={localize(value)}
              height={16}
              width={16}
            />
          ) : (
            <LinkOutlined
              className="image-container__image--default image--default"
              height={16}
              width={16}
            />
          )}
        </div>
        <RichTextRenderer>{localize(value)}</RichTextRenderer>
      </button>
    );
  }
  return <RichTextRenderer>{localize(value)}</RichTextRenderer>;
};

export const Cards = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();
  const { localize } = useLocalizedText();
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
              } as Card)
          )
        : []),
    [config.cards, preview, previewText]
  );

  const getCoverStyle = useCallback(
    (index: number) => {
      const { cover } = cards[index] || {};
      const isUrl = cover && cover.match(/^http/);
      return {
        backgroundImage: isUrl ? `url(${cover})` : undefined,
        backgroundColor: isUrl ? undefined : cover || getRandomColor(index),
      };
    },
    [cards]
  );

  return (
    <div className={tw`block-cards flex flex-col w-full`}>
      <div
        className={tw`block-cards__title-container title-container pt-8 pl-8`}
      >
        {config.title && <BlockTitle value={localize(config.title)} />}
      </div>
      <div
        className={tw`block-cards__cards-container cards-container relative !pt-0 w-full overflow-hidden`}
      >
        <div
          ref={container}
          className={`cards-container__cards-container cards-container ${styles.container}`}
        >
          {(cards as Card[]).map(
            ({ title, description, cover, content = [] }, index) => (
              <div
                key={index}
                className={`${tw`cards-container__card-container card-container flex flex-col snap-start my-6 pl-[10px] group w-[15rem] min-h-[23rem] flex-card`}`}
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
                      {localize(description)}
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
                              >
                                <div
                                  className={
                                    'accordion-content-container__content content'
                                  }
                                >
                                  <RichTextRenderer>
                                    {localize(item.content)}
                                  </RichTextRenderer>
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
        {canScroll && (
          <div className={`${tw`block-cards__scroll text-accent text-l`}`}>
            <div
              className={tw`block-cards__scroll__left absolute flex justify-center top-16 left-6 h-8 w-8 bg-white rounded-[100%] shadow-lg`}
            >
              <Tooltip title={t('cards.prev')} placement="right">
                <button
                  onClick={scroll(-1)}
                  className={'block-cards__scroll__left__button outline-none'}
                >
                  <LeftOutlined
                    className={tw`block-cards__scroll__left__button__icon bg-white rounded-[50%]`}
                  />
                </button>
              </Tooltip>
            </div>
            <div
              className={tw`block-cards__scroll__right absolute flex justify-center top-16 right-6 h-8 w-8 bg-white rounded-[100%] shadow-lg`}
            >
              <Tooltip title={t('cards.next')} placement="left">
                <button
                  onClick={scroll(1)}
                  className={tw`block-cards__scroll__right__button outline-none`}
                >
                  <RightOutlined
                    className={tw`block-cards__scroll__right__button__icon bg-white rounded-[50%]`}
                  />
                </button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withI18nProvider(Cards);
