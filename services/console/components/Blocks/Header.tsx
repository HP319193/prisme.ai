import { useBlock } from '@prisme.ai/design-system';
import getConfig from 'next/config';
import Link from 'next/link';
import { FC, HTMLAttributes, useCallback, useEffect, useState } from 'react';
import api from '../../utils/api';
import { EnhancedSchema } from '../SchemaForm/useSchema';

const {
  publicRuntimeConfig: { PAGES_HOST = '' },
} = getConfig();

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

const schema: EnhancedSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      title: 'pages.blocks.header.settings.title.label',
      description: 'pages.blocks.header.settings.title.description',
    },
    logo: {
      type: 'object',
      title: 'pages.blocks.header.settings.logo.label',
      description: 'pages.blocks.header.settings.logo.description',
      properties: {
        src: {
          type: 'string',
          title: 'pages.blocks.header.settings.logo.src.label',
          description: 'pages.blocks.header.settings.logo.src.description',
          'ui:widget': 'upload',
        },
        alt: {
          type: 'string',
          title: 'pages.blocks.header.settings.logo.alt.label',
          description: 'pages.blocks.header.settings.logo.alt.description',
        },
      },
    },
    nav: {
      type: 'array',
      title: 'pages.blocks.header.settings.nav.label',
      description: 'pages.blocks.header.settings.nav.description',
      items: {
        type: 'object',
        title: 'pages.blocks.header.settings.nav.items.label',
        description: 'pages.blocks.header.settings.nav.items.description',
        oneOf: [
          {
            title: 'pages.blocks.header.settings.nav.items.external.label',
            description: 'pages.blocks.header.settings.nav.items.description',
            properties: {
              text: {
                type: 'string',
                title: 'pages.blocks.header.settings.nav.items.text.label',
                description:
                  'pages.blocks.header.settings.nav.items.text.description',
              },
              value: {
                type: 'string',
                title:
                  'pages.blocks.header.settings.nav.items.external.value.label',
                description:
                  'pages.blocks.header.settings.nav.items.external.value.description',
              },
            },
          },
          {
            title: 'pages.blocks.header.settings.nav.items.internal.label',
            description:
              'pages.blocks.header.settings.nav.items.internal.description',
            properties: {
              text: {
                type: 'string',
                title: 'pages.blocks.header.settings.nav.items.text.label',
                description:
                  'pages.blocks.header.settings.nav.items.text.description',
              },
              value: {
                type: 'string',
                title:
                  'pages.blocks.header.settings.nav.items.internal.value.label',
                description:
                  'pages.blocks.header.settings.nav.items.internal.value.description',
                'ui:widget': 'select:pages',
              },
            },
          },
          {
            title: 'pages.blocks.header.settings.nav.items.inside.label',
            description:
              'pages.blocks.header.settings.nav.items.inside.description',
            properties: {
              text: {
                type: 'string',
                title: 'pages.blocks.header.settings.nav.items.text.label',
                description:
                  'pages.blocks.header.settings.nav.items.text.description',
              },
              value: {
                type: 'string',
                title:
                  'pages.blocks.header.settings.nav.items.inside.value.label',
                description:
                  'pages.blocks.header.settings.nav.items.inside.value.description',
                'ui:widget': 'select:pageSections',
              },
            },
          },
          {
            title: 'pages.blocks.header.settings.nav.items.event.label',
            description:
              'pages.blocks.header.settings.nav.items.event.description',
            properties: {
              text: {
                type: 'string',
                title: 'pages.blocks.header.settings.nav.items.text.label',
                description:
                  'pages.blocks.header.settings.nav.items.text.description',
              },
              value: {
                type: 'string',
                title:
                  'pages.blocks.header.settings.nav.items.event.value.label',
                description:
                  'pages.blocks.header.settings.nav.items.event.value.description',
              },
            },
          },
        ],
        'ui:options': {
          oneOf: {
            options: [
              {
                label: 'pages.blocks.header.settings.nav.items.external.label',
                index: 0,
                value: {
                  type: 'external',
                },
              },
              {
                label: 'pages.blocks.header.settings.nav.items.internal.label',
                index: 1,
                value: {
                  type: 'internal',
                },
              },
              {
                label: 'pages.blocks.header.settings.nav.items.inside.label',
                index: 2,
                value: {
                  type: 'inside',
                },
              },
              {
                label: 'pages.blocks.header.settings.nav.items.event.label',
                index: 3,
                value: {
                  type: 'event',
                },
              },
            ],
          },
        },
      },
      'ui:options': {
        array: 'row',
      },
    },
  },
};

const LinkOrNot: FC<{ href?: string }> = ({ href, children }) => {
  if (href) {
    return (
      <Link href={href}>
        <a className="block-header__nav-item-link">{children}</a>
      </Link>
    );
  }
  return <>{children}</>;
};

const PageLink: FC<{ pageId: string } & HTMLAttributes<HTMLAnchorElement>> = ({
  pageId,
  ...props
}) => {
  const [href, setHref] = useState('');
  const fetchHref = useCallback(async (pageId: string) => {
    try {
      const { slug = pageId } = await api.getPageBySlug(pageId);
      setHref(slug);
    } catch {}
  }, []);
  useEffect(() => {
    fetchHref(pageId);
  }, [fetchHref, pageId]);
  return (
    <Link href={href}>
      <a {...props} />
    </Link>
  );
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
          className="block-header__nav-item-button"
        >
          {text}
        </button>
      );
    case 'external':
      return (
        <a href={value} className="block-header__nav-item-link">
          <button className="block-header__nav-item-button">{text}</button>
        </a>
      );
    case 'internal':
      return (
        <PageLink pageId={value} className="block-header__nav-item-link">
          <button className="block-header__nav-item-button">{text}</button>
        </PageLink>
      );
    case 'inside':
      return (
        <a href={`#${value}`} className="block-header__nav-item-link">
          <button className="block-header__nav-item-button">{text}</button>
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
    <div className="block-header block-header__container flex flex-1 flex-col sm:!flex-row justify-between sm:items-center">
      <div className="block-header__left flex sm:justify-center">
        <div className="block-header__logo flex justify-center m-2 ml-4">
          {config.logo && config.logo.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.logo.src}
              alt={config.logo.alt}
              className="block-header__logo-image max-h-12"
            />
          )}
        </div>
        <h1 className="block-header__title flex items-center m-0 font-bold">
          {config.title}
        </h1>
      </div>
      <nav className="block-header__right flex m-4">
        {nav.map((props, k) => (
          <div
            key={k}
            className="mx-2"
            onClick={(e) => {
              if (edit) e.preventDefault();
            }}
          >
            <Button {...props} />
          </div>
        ))}
      </nav>
    </div>
  );
};

Header.schema = schema;

export default Header;
