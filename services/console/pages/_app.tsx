import type { AppProps } from 'next/app';
import { appWithTranslation, useTranslation } from 'next-i18next';
import NextLink from 'next/link';
import Image from 'next/image';
import { Loading as DSLoading } from '@prisme.ai/design-system';
import { BlocksProvider } from '@prisme.ai/blocks';
import UserProvider from '../components/UserProvider';
import { NextPage } from 'next';
import React, { HTMLAttributes, ReactElement, ReactNode } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import '../styles/globals.css';
import '../styles/tailwind-console.css';
import '@prisme.ai/design-system/styles/index.css';
import '@prisme.ai/design-system/styles/prismeai-theme.css';
import PermissionsProvider from '../components/PermissionsProvider';
import { AppsProvider } from '../components/AppsProvider';
import down from '../icons/down.svg';
import { WorkspacesUsageProvider } from '../components/WorkspacesUsage';
import externals from '../utils/externals';
import QueryStringProvider from '../components/QueryStringProvider';
import WorkspacesProvider from '../providers/Workspaces/WorkspacesProvider';

const Sentry = dynamic(import('../utils/Sentry'), { ssr: false });

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
const Link = ({
  href = '',
  ...props
}: { href: string } & HTMLAttributes<HTMLAnchorElement>) => {
  return <NextLink {...props} href={href || ''} />;
};
const DownIcon = ({ className }: { className?: string }) => (
  <Image src={down.src} width={14} height={14} alt="" className={className} />
);

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

  if (Component.isPublic) {
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

  return (
    <QueryStringProvider>
      <UserProvider redirectTo="/workspaces">
        <WorkspacesProvider>
          <WorkspacesUsageProvider>
            <PermissionsProvider>
              <AppsProvider>
                <BlocksProvider
                  externals={externals}
                  components={{ Link, Loading, DownIcon }}
                >
                  <Head>
                    <title>{t('main.title')}</title>
                    <meta
                      name="viewport"
                      content="width=device-width,initial-scale=1, maximum-scale=1, shrink-to-fit=no, viewport-fit=cover"
                    />
                    <meta name="description" content={t('main.description')} />
                    <link rel="icon" href="/favicon.png" />
                  </Head>
                  <Sentry />
                  {getLayout(<Component {...pageProps} />)}
                </BlocksProvider>
              </AppsProvider>
            </PermissionsProvider>
          </WorkspacesUsageProvider>
        </WorkspacesProvider>
      </UserProvider>
    </QueryStringProvider>
  );
}

export default appWithTranslation(MyApp);
