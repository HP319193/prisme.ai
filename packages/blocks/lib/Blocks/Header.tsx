import '../i18n';
import tw from '../tw';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';

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
  const {
    components: { Link },
  } = useBlocks();
  const fetchHref = useCallback(async (pageId: string) => {
    if (!api) return;
    try {
      const { slug = pageId } = await api.getPageBySlug(pageId);
      setHref(slug);
    } catch {}
  }, []);
  useEffect(() => {
    fetchHref(pageId);
  }, [fetchHref, pageId]);

  return <Link href={href} {...props} />;
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
      className={tw`block-header flex flex-1 flex-col md:!flex-row justify-between md:items-center px-4 py-2`}
    >
      <div className={tw`block-header__left left flex md:justify-center`}>
        <div className={tw`left__logo logo flex justify-center m-2 ml-4`}>
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
      <nav className={tw`block-header__right right flex m-4`}>
        {nav.map((props, k) => (
          <div
            key={k}
            className={tw`right__nav nav mx-2`}
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
