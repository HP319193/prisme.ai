import type { AppProps } from 'next/app';
import { appWithTranslation, useTranslation } from 'next-i18next';
import UserProvider from '../../console/components/UserProvider';
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
import {
  PageProvider,
  PageProviderProps,
} from '../components/Page/PageProvider';
import BlocksProvider from '../components/BlocksProvider/BlocksProvider';
import WorkspaceProvider from '../components/Workspace';

const Sentry = dynamic(import('../../console/utils/Sentry'), { ssr: false });

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
  isPublic?: boolean;
};

type AppPropsWithLayout = AppProps<PageProviderProps> & {
  Component: NextPageWithLayout;
};

function MyApp({
  Component,
  pageProps: { page, error, initialConfig },
}: AppPropsWithLayout) {
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
    <WorkspaceProvider>
      <UserProvider anonymous isPublic>
        <PageProvider page={page} error={error} initialConfig={initialConfig}>
          <BlocksProvider>
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
            {getLayout(<Component />)}
          </BlocksProvider>
        </PageProvider>
      </UserProvider>
    </WorkspaceProvider>
  );
}

export default appWithTranslation<any>(MyApp);
