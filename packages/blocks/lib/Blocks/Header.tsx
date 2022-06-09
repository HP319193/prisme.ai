import '../i18n';
import { tw } from 'twind';
import { useBlock, useBlocks } from '../Provider';

import { FC, HTMLAttributes, useCallback, useEffect, useState } from 'react';
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

const PageLink: FC<{ pageId: string } & HTMLAttributes<HTMLAnchorElement>> = ({
  pageId,
  ...props
}) => {
  const [href, setHref] = useState('');
  const { api } = useBlock();
  const { linkGenerator } = useBlocks();
  const fetchHref = useCallback(async (pageId: string) => {
    try {
      const { slug = pageId } = await api.getPageBySlug(pageId);
      setHref(slug);
    } catch {}
  }, []);
  useEffect(() => {
    fetchHref(pageId);
  }, [fetchHref, pageId]);

  if (linkGenerator) {
    return linkGenerator(href, props);
  }
  return <a href={href} {...props} />;
};

const Button = ({ text, type, value }: Config['nav'][number]) => {
  const { events } = useBlock<Config>();
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
      return (
        <a href={value} className={tw`block-header__nav-item-link`}>
          <button className={tw`block-header__nav-item-button`}>{text}</button>
        </a>
      );
    case 'internal':
      return (
        <PageLink pageId={value} className={tw`block-header__nav-item-link`}>
          <button className={tw`block-header__nav-item-button`}>{text}</button>
        </PageLink>
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
