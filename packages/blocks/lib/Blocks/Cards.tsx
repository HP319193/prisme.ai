import '../i18n';
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
import BlockTitle from './Internal/BlockTitle';
import { useBlock } from '../Provider';
import { tw } from 'twind';
import useLocalizedTextBlock from '../useLocalizedTextBlock';

interface Card {
  title?: Prismeai.LocalizedText;
  description?: Prismeai.LocalizedText;
  cover?: string;
  content?: (
    | {
        type: 'text';
        value: Prismeai.LocalizedText;
      }
    | {
        type: 'button';
        value: Prismeai.LocalizedText;
        url?: Prismeai.LocalizedText;
        event?: string;
        payload?: any;
        icon?: string;
      }
    | {
        type: 'accordion';
        title: Prismeai.LocalizedText;
        content: Prismeai.LocalizedText;
        icon?: string;
      }
  )[];
}

const Accordion: FC<{
  title: ReactNode;
}> = ({ title, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className={tw`flex flex-1 flex-col`}>
      <button
        className={tw`flex flex-1 justify-between items-center p-2`}
        onClick={() => setVisible(!visible)}
      >
        {title}
        <DownOutlined
          className={tw`transition-transform ${visible ? '-rotate-180' : ''}`}
        />
      </button>
      <StretchContent visible={visible}>
        <div className={tw`p-2`}>{children}</div>
      </StretchContent>
    </div>
  );
};

export const Cards = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation('pages');
  const { localize } = useLocalizedTextBlock();
  const { config = {}, events } = useBlock();

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
      current.scrollBy({ left: step, top: 0, behavior: 'smooth' });
      setTimeout(() => {
        if (currentLeft === current.scrollLeft) {
          current.scrollBy({
            left: current.scrollWidth * -step,
            top: 0,
            behavior: 'smooth',
          });
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

  const canScroll =
    (!config.layout ||
      !config.layout.type ||
      config.layout.type === 'carousel') &&
    container.current &&
    container.current.scrollWidth >
      container.current.getBoundingClientRect().width;

  const styles = useMemo(() => {
    const { layout: { type = 'carousel' } = {} } = config;
    switch (type) {
      case 'grid':
        return {
          container: 'flex flex-row flex-wrap justify-center',
        };
      case 'column':
        return {
          container: 'flex flex-wrap flex-col items-center',
        };
      case 'carousel':
      default:
        return {
          container:
            'flex flex-row flex-nowrap overflow-auto pr-[100vw] snap-x snap-mandatory pb-6',
        };
    }
  }, [config]);

  const preview = !!(!config.cards && edit);
  const previewText = t('preview');
  const cards = useMemo(
    () =>
      config.cards ||
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

  return (
    <div>
      <div className={tw`pt-8 pl-8`}>
        {config.title && <BlockTitle value={config.title} />}
      </div>
      <div className={tw`relative p-4 !pt-0`}>
        <div ref={container} className={styles.container}>
          {(cards as Card[]).map(
            ({ title, description, cover, content = [] }, index) => (
              <div
                key={index}
                className={tw`flex flex-col snap-start my-4 pl-[10px] group w-[325px]`}
                style={{
                  flex: '0 0 325px',
                }}
              >
                <div
                  className={tw`relative flex flex-1 flex-col mx-2 rounded-[20px]`}
                >
                  <div
                    className={tw`h-[303px] p-[-1px] rounded-[20px] absolute top-0 left-0 right-0 bg-no-repeat bg-contain bg-top`}
                    style={{
                      backgroundImage: cover ? `url(${cover})` : undefined,
                      backgroundColor: cover
                        ? undefined
                        : getRandomColor(index),
                    }}
                  />
                  <div
                    className={tw`
                      relative flex flex-col min-h-[203px] mt-[103px]
                      rounded-[20px] p-4 border-[1px] border-gray-200
                      bg-white
                      transition-transform
                      group-hover:translate-y-3 group-hover:scale-105 shadow-sm group-hover:shadow-lg
                      `}
                  >
                    <div
                      className={tw`font-bold text-sm text-accent text-center`}
                    >
                      {localize(title)}
                    </div>
                    <div
                      className={tw`text-[10px] my-2 text-neutral-500 text-center`}
                    >
                      {localize(description)}
                    </div>
                    {content &&
                      Array.isArray(content) &&
                      content.map((item, index) => (
                        <div key={index} className={tw`flex mb-4`}>
                          {item.type === 'text' && (
                            <div>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: localize(item.value),
                                }}
                              />
                            </div>
                          )}
                          {item.type === 'button' && (
                            <button
                              className={tw`flex flex-1 flex-row bg-[#E6EFFF] text-[10px] text-accent p-4 rounded text-left`}
                              onClick={() => {
                                if (item.url) {
                                  window.open(localize(item.url));
                                }
                                if (item.event && events) {
                                  events.emit(item.event, item.payload);
                                }
                              }}
                            >
                              <div className={tw`flex mr-2`}>
                                {item.icon ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.icon}
                                    alt={localize(item.value)}
                                    height={16}
                                    width={16}
                                  />
                                ) : (
                                  <LinkOutlined height={16} width={16} />
                                )}
                              </div>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: localize(item.value).replace(
                                    /\n/g,
                                    '<br />'
                                  ),
                                }}
                              />
                            </button>
                          )}
                          {item.type === 'accordion' && (
                            <div
                              className={tw`flex flex-1 border-[1px] border-neutral-200 rounded p-2`}
                            >
                              <Accordion
                                title={
                                  <div
                                    className={tw`flex flex-row items-center`}
                                  >
                                    {item.icon && (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={item.icon}
                                        alt={localize(item.title)}
                                        width={16}
                                        height={16}
                                        className={tw`mr-2`}
                                      />
                                    )}{' '}
                                    {localize(item.title)}
                                  </div>
                                }
                              >
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: localize(item.content),
                                  }}
                                />
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
          <div className={tw`text-accent text-l`}>
            <div
              className={tw`absolute flex justify-center top-16 left-6 h-8 w-8 bg-white rounded-[100%] shadow-lg`}
            >
              <Tooltip title={t('blocks.cards.prev')} placement="right">
                <button onClick={scroll(-1)} className={'outline-none'}>
                  <LeftOutlined className={tw`bg-white rounded-[50%]`} />
                </button>
              </Tooltip>
            </div>
            <div
              className={tw`absolute flex justify-center top-16 right-6 h-8 w-8 bg-white rounded-[100%] shadow-lg`}
            >
              <Tooltip title={t('blocks.cards.next')} placement="left">
                <button onClick={scroll(1)} className={tw`outline-none`}>
                  <RightOutlined className={tw`bg-white rounded-[50%]`} />
                </button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Cards;
