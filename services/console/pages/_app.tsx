import type { AppProps } from 'next/app';
import { appWithTranslation, useTranslation } from 'next-i18next';
import NextLink from 'next/link';
import Image from 'next/image';
import ReactDom from 'react-dom';
import * as prismeaiDS from '@prisme.ai/design-system';
import { Loading as DSLoading } from '@prisme.ai/design-system';
import * as prismeaiBlocks from '@prisme.ai/blocks';
import { BlocksProvider } from '@prisme.ai/blocks';
import * as prismeaiSDK from '../utils/api';
import UserProvider from '../components/UserProvider';
import WorkspacesProvider from '../components/WorkspacesProvider';
import { NextPage } from 'next';
import React, { HTMLAttributes, ReactElement, ReactNode } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import '../styles/globals.css';
import '../styles/tailwind-console.css';
import '@prisme.ai/design-system/styles/index.css';
import '@prisme.ai/design-system/styles/theme.css';
import PermissionsProvider from '../components/PermissionsProvider';
import { AppsProvider } from '../components/AppsProvider';
import PagesProvider from '../components/PagesProvider/PagesProvider';
import down from '../icons/down.svg';

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

const Loading = () => (
  <DSLoading className="bg-white absolute top-0 right-0 bottom-0 left-0" />
);
const Link = ({
  href = '',
  ...props
}: { href: string } & HTMLAttributes<HTMLAnchorElement>) => {
  const link = `${href}`.match(/^http/) ? href : `/pages/${href}`;

  return (
    <NextLink href={link}>
      <a {...props} />
    </NextLink>
  );
};
const DownIcon = ({ className }: { className?: string }) => (
  <Image src={down.src} width={14} height={14} alt="" className={className} />
);

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const { t } = useTranslation('common');

  if (Component.isPublic) {
    return (
      <UserProvider anonymous>
        <PagesProvider>
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
            </PagesProvider>
          </AppsProvider>
        </PermissionsProvider>
      </WorkspacesProvider>
    </UserProvider>
  );
}

export default appWithTranslation(MyApp);
