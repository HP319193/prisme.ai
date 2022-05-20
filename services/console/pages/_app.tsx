import type { AppProps } from 'next/app';
import { appWithTranslation, useTranslation } from 'next-i18next';
import UserProvider from '../components/UserProvider';
import WorkspacesProvider from '../components/WorkspacesProvider';
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import '../styles/globals.css';
import '../styles/tailwind-console.css';
import '@prisme.ai/design-system/styles/index.css';
import '@prisme.ai/design-system/styles/theme.css';
import PermissionsProvider from '../components/PermissionsProvider';
import { AppsProvider } from '../components/AppsProvider';
import PagesProvider from '../components/PagesProvider/PagesProvider';

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
  const { t } = useTranslation('common');

  if (Component.isPublic) {
    return (
      <UserProvider anonymous>
        <PagesProvider>
          <Head>
            <title>{t('main.title')}</title>
            <meta name="description" content={t('main.description')} />
            <link rel="icon" href="/favicon.png" />
          </Head>
          <Sentry />
          {getLayout(<Component {...pageProps} />)}
        </PagesProvider>
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <WorkspacesProvider>
        <PermissionsProvider>
          <AppsProvider>
            <PagesProvider>
              <Head>
                <title>{t('main.title')}</title>
                <meta name="description" content={t('main.description')} />
                <link rel="icon" href="/favicon.png" />
              </Head>
              <Sentry />
              {getLayout(<Component {...pageProps} />)}
            </PagesProvider>
          </AppsProvider>
        </PermissionsProvider>
      </WorkspacesProvider>
    </UserProvider>
  );
}

export default appWithTranslation(MyApp);
