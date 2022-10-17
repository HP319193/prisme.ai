import type { AppProps } from 'next/app';
import { appWithTranslation, useTranslation } from 'next-i18next';
import NextLink from 'next/link';
import Image from 'next/image';
import { Loading as DSLoading } from '@prisme.ai/design-system';
import { BlocksProvider } from '@prisme.ai/blocks';
import UserProvider from '../../console/components/UserProvider';
import { NextPage } from 'next';
import React, {
  Children,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useCallback,
  useState,
} from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import '../styles/globals.css';
import '../styles/tailwind-console.css';
import '@prisme.ai/design-system/styles/index.css';
import '@prisme.ai/design-system/styles/prismeai-theme.css';
import down from '../../console//icons/down.svg';
import externals from '../../console/utils/externals';
import { usePreview } from '../components/usePreview';

const Sentry = dynamic(import('../../console/utils/Sentry'), { ssr: false });

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
  isPublic?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const Loading = () => (
  <DSLoading className="bg-white absolute top-0 right-0 bottom-0 left-0" />
);
const DownIcon = ({ className }: { className?: string }) => (
  <Image src={down.src} width={14} height={14} alt="" className={className} />
);

const Link = ({
  href,
  children,
  ...props
}: { href: string; children: ReactElement } & HTMLAttributes<
  HTMLAnchorElement
>) => {
  const [isPreview, setIsPreview] = useState(false);
  const setPreview = useCallback(() => {
    setIsPreview(true);
  }, []);
  usePreview(setPreview);

  return (
    <NextLink
      href={href}
      {...props}
      children={React.cloneElement(children, {
        onClick(e: any) {
          if (children.props.onClick) children.props.onClick(e);
          if (!isPreview) return;
          window.parent.postMessage(
            { type: 'pagePreviewNavigation', href },
            '*'
          );
        },
      })}
    />
  );
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const { t, i18n } = useTranslation('common');

  if (i18n.language === 'default' && typeof window !== 'undefined') {
    const availableLanguages: string[] = (i18n.options as any).locales;
    const navLang = window.navigator.language.substring(0, 2);
    const currentLang = availableLanguages.includes(navLang) ? navLang : 'en';
    location.pathname = `${currentLang}/${location.pathname}`;
    return null;
  }

  return (
    <UserProvider anonymous>
      <BlocksProvider
        externals={externals}
        components={{ Link, Loading, DownIcon }}
      >
        <Head>
          <title>{t('main.title')}</title>
          <meta name="description" content={t('main.description')} />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1, maximum-scale=1, shrink-to-fit=no, viewport-fit=cover"
          />
          <link rel="icon" href="/favicon.png" />
        </Head>
        <Sentry />
        {getLayout(<Component {...pageProps} />)}
      </BlocksProvider>
    </UserProvider>
  );
}

export default appWithTranslation(MyApp);
