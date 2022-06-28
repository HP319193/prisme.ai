import '../i18n';
import { tw } from 'twind';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';

import { withI18nProvider } from '../i18n';

interface Config {
  title?: string;
  logo?: {
    src: string;
    alt: string;
  };
  nav: {
    text: string;
    type: 'external' | 'internal' | 'inside' | 'event';
    value: string;
  }[];
}

const Button = ({ text, type, value }: Config['nav'][number]) => {
  const { events } = useBlock<Config>();
  const {
    components: { Link },
  } = useBlocks();
  switch (type) {
    case 'event':
      return (
        <button
          onClick={() => {
            if (!events || !value) return;
            events.emit(value);
          }}
          className={tw`block-header__nav-item-button`}
        >
          {text}
        </button>
      );
    case 'external':
    case 'internal':
      return (
        <Link href={value} className={tw`block-header__nav-item-link`}>
          <button className={tw`block-header__nav-item-button`}>{text}</button>
        </Link>
      );
    case 'inside':
      return (
        <a href={`#${value}`} className={tw`block-header__nav-item-link`}>
          <button className={tw`block-header__nav-item-button`}>{text}</button>
        </a>
      );
    default:
      return null;
  }
};

export const Header = ({ edit }: { edit?: boolean }) => {
  const { config = {} as Config } = useBlock<Config>();

  const nav = config.nav && Array.isArray(config.nav) ? config.nav : [];

  return (
    <div
      className={tw`block-header block-header__container flex flex-1 flex-col md:!flex-row justify-between md:items-center px-4 py-2`}
    >
      <div className={tw`block-header__left flex md:justify-center`}>
        <div className={tw`block-header__logo flex justify-center m-2 ml-4`}>
          {config.logo && config.logo.src && (
            <img
              src={config.logo.src}
              alt={config.logo.alt}
              className={tw`block-header__logo-image max-h-12`}
            />
          )}
        </div>
        <h1 className={tw`block-header__title flex items-center m-0 font-bold`}>
          {config.title}
        </h1>
      </div>
      <nav className={tw`block-header__right flex m-4`}>
        {nav.map((props, k) => (
          <div
            key={k}
            className={tw`mx-2`}
            onClick={(e) => {
              if (edit) e.preventDefault();
            }}
          >
            {edit ? (
              <button className={tw`block-header__nav-item-button`}>
                {props.text}
              </button>
            ) : (
              <Button {...props} />
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default withI18nProvider(Header);
