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
import Storage from '../utils/Storage';
import QueryString from 'qs';
import InstallWorkspace from '../components/InstallWorkspace';

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
        <PublicBlocksProvider>
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
            </PermissionsProvider>
          </WorkspacesUsageProvider>
        </WorkspacesProvider>
      </UserProvider>
    </QueryStringProvider>
  );
}

export default appWithTranslation(MyApp);
