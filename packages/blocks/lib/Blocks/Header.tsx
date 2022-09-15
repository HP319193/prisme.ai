import '../i18n';
import tw from '../tw';
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
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    case 'external':
    case 'internal':
      return (
        <Link href={value} className={tw`block-header__nav-item-link`}>
          <button
            className={tw`block-header__nav-item-button`}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </Link>
      );
    case 'inside':
      return (
        <a href={`#${value}`} className={tw`block-header__nav-item-link`}>
          <button
            className={tw`block-header__nav-item-button`}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </a>
      );
    default:
      return null;
  }
};

export const Header = ({ edit }: { edit?: boolean }) => {
  const { config = {} as Config } = useBlock<Config>();

  const nav = config.nav && Array.isArray(config.nav) ? config.nav : [];

  const inlineLinks = nav.length < 2;
  return (
    <div
      className={tw`block-header flex flex-1 flex-col ${
        inlineLinks ? '!flex-row' : 'md:!flex-row'
      } justify-between md:items-center`}
    >
      <div
        className={tw`block-header__left left flex ${
          inlineLinks ? '' : 'md:justify-center'
        }`}
      >
        <div className={tw`left__logo logo flex justify-center`}>
          {config.logo && config.logo.src && (
            <img
              src={config.logo.src}
              alt={config.logo.alt}
              className={tw`logo__image image max-h-12`}
            />
          )}
        </div>
        <h1 className={tw`left__title title flex items-center m-0 font-bold`}>
          {config.title}
        </h1>
      </div>
      <nav className={tw`block-header__right right flex`}>
        {nav.map((props, k) => (
          <div
            key={k}
            className={tw`right__nav nav mx-2 text-[0.875rem]`}
            onClick={(e) => {
              if (edit) e.preventDefault();
            }}
          >
            {edit ? (
              <button className={tw`nav__nav-item nav-item`}>
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
