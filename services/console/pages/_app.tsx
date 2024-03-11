import type { AppProps } from 'next/app';
import { appWithTranslation, useTranslation } from 'next-i18next';
import UserProvider from '../components/UserProvider';
import { NextPage } from 'next';
import React, { ReactElement, ReactNode } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import '../styles/globals.css';
import '../styles/tailwind-console.css';
import '@prisme.ai/design-system/styles/index.css';
import '@prisme.ai/design-system/styles/prismeai-theme.css';
import '@prisme.ai/design-system/styles/schema-form.css';
import 'react-quill/dist/quill.snow.css';
import QueryStringProvider from '../providers/QueryStringProvider';
import { PublicBlocksProvider } from '../components/BlocksProvider';
import Tracking from '../components/Tracking';
import Storage from '../utils/Storage';
import UserSpace from '../components/UserSpace/UserSpace';

const Sentry = dynamic(import('../utils/Sentry'), { ssr: false });

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
  isPublic?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps, router }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const { t, i18n } = useTranslation('common');

  if (typeof window !== 'undefined') {
    const currentURL = new URL(location.href);
    const authCode = currentURL.searchParams.get('code');
    const isAuthorizationCallback =
      currentURL.pathname.includes('/signin') &&
      authCode &&
      currentURL.searchParams.get('iss');
    if (i18n.language === 'default' && !isAuthorizationCallback) {
      const availableLanguages: string[] = (i18n.options as any).locales;
      const navLang = window.navigator.language.substring(0, 2);
      const currentLang = availableLanguages.includes(navLang) ? navLang : 'en';
      location.pathname = `${currentLang}/${location.pathname}`;
      return null;
    }
    const accessToken = currentURL.searchParams.get('access-token');
    if (accessToken) {
      Storage.set('access-token', accessToken);
    }
  }

  if (Component.isPublic) {
    return (
      <UserProvider anonymous>
        <PublicBlocksProvider>
          <Tracking>
            <Head>
              <title>{t('main.title')}</title>
              <meta name="description" content={t('main.description')} />
              <meta
                name="viewport"
                content="width=device-width,initial-scale=1, maximum-scale=1, shrink-to-fit=no, viewport-fit=cover"
              />
              <link rel="icon" href="/favicon.png" />
              <link rel="manifest" href="/manifest.webmanifest" />
            </Head>
            <Sentry />
            {getLayout(<Component {...pageProps} />)}
          </Tracking>
        </PublicBlocksProvider>
      </UserProvider>
    );
  }

  return (
    <QueryStringProvider>
      <UserProvider redirectTo="/">
        <Head>
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1, maximum-scale=1, shrink-to-fit=no, viewport-fit=cover"
          />
          <link rel="icon" href="/favicon.png" />
          <link rel="manifest" href="/manifest.webmanifest" />
        </Head>
        <UserSpace>{getLayout(<Component {...pageProps} />)}</UserSpace>
      </UserProvider>
    </QueryStringProvider>
  );
}

export default appWithTranslation(MyApp);
