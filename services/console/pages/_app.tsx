import type { AppProps } from 'next/app';
import { appWithTranslation, useTranslation } from 'next-i18next';
import Link from 'next/link';
import ReactDom from 'react-dom';
import * as prismeaiDS from '@prisme.ai/design-system';
import * as prismeaiBlocks from '@prisme.ai/blocks';
import { BlocksProvider } from '@prisme.ai/blocks';
import * as prismeaiSDK from '../utils/api';
import UserProvider from '../components/UserProvider';
import WorkspacesProvider from '../components/WorkspacesProvider';
import { NextPage } from 'next';
import React, { ReactElement, ReactNode } from 'react';
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

const externals = {
  React: { ...React, default: React },
  ReactDom: { ...ReactDom, default: ReactDom },
  prismeaiDS,
  prismeaiSDK,
  prismeaiBlocks,
};

const linkGenerator = (url: string, props: any) => (
  <Link href={url}>
    <a {...props} />
  </Link>
);

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const { t } = useTranslation('common');

  if (Component.isPublic) {
    return (
      <UserProvider anonymous>
        <PagesProvider>
          <BlocksProvider externals={externals} linkGenerator={linkGenerator}>
            <Head>
              <title>{t('main.title')}</title>
              <meta name="description" content={t('main.description')} />
              <link rel="icon" href="/favicon.png" />
            </Head>
            <Sentry />
            {getLayout(<Component {...pageProps} />)}
          </BlocksProvider>
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
              <BlocksProvider
                externals={externals}
                linkGenerator={linkGenerator}
              >
                <Head>
                  <title>{t('main.title')}</title>
                  <meta name="description" content={t('main.description')} />
                  <link rel="icon" href="/favicon.png" />
                </Head>
                <Sentry />
                {getLayout(<Component {...pageProps} />)}
              </BlocksProvider>
            </PagesProvider>
          </AppsProvider>
        </PermissionsProvider>
      </WorkspacesProvider>
    </UserProvider>
  );
}

export default appWithTranslation(MyApp);
