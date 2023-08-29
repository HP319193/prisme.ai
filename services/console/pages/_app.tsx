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
import PermissionsProvider from '../components/PermissionsProvider';
import { WorkspacesUsageProvider } from '../components/WorkspacesUsage';
import QueryStringProvider from '../providers/QueryStringProvider';
import WorkspacesProvider from '../providers/Workspaces/WorkspacesProvider';
import { PublicBlocksProvider } from '../components/BlocksProvider';
import OnBoarding from '../components/OnBoarding';
import InstallWorkspace from '../components/InstallWorkspace';
import Tracking from '../components/Tracking';
import Storage from '../utils/Storage';

const Sentry = dynamic(import('../utils/Sentry'), { ssr: false });

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
  isPublic?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
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
      <UserProvider redirectTo="/workspaces">
        <WorkspacesProvider>
          <WorkspacesUsageProvider>
            <PermissionsProvider>
              <Tracking>
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
                <InstallWorkspace>
                  {getLayout(<Component {...pageProps} />)}
                  <OnBoarding />
                </InstallWorkspace>
              </Tracking>
            </PermissionsProvider>
          </WorkspacesUsageProvider>
        </WorkspacesProvider>
      </UserProvider>
    </QueryStringProvider>
  );
}

export default appWithTranslation(MyApp);
