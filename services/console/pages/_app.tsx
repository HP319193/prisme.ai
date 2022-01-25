import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation, useTranslation } from "next-i18next";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import UserProvider from "../components/UserProvider";
import WorkspacesProvider from "../components/WorkspacesProvider";
import { NextPage } from "next";
import { ReactElement, ReactNode } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Toaster from "../layouts/Toaster";

const Sentry = dynamic(import("../utils/Sentry"), { ssr: false });

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const { t } = useTranslation("common");

  return (
    <UserProvider>
      <WorkspacesProvider>
        <Head>
          <title>{t("main.title")}</title>
          <meta name="description" content={t("main.description")} />
          <link rel="icon" href="/favicon.png" />
        </Head>
        <Sentry />
        <Toaster>{getLayout(<Component {...pageProps} />)}</Toaster>
      </WorkspacesProvider>
    </UserProvider>
  );
}

export default appWithTranslation(MyApp);
