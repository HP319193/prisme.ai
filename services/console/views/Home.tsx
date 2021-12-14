import { NextPage } from "next";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import Link from "next/link";

import FullScreen from "../layouts/FullScreen";

export const Home: NextPage = () => {
  const { t } = useTranslation("common");
  return (
    <FullScreen>
      <Head>
        <title>Prisme.ai Console</title>
        <meta name="description" content="Prisme.ai" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex align-items-center justify-content-center flex-column">
        <h1 className="flex">{t("home.title")}</h1>
        <Button>
          <Link href="/signin">{t("home.signin")}</Link>
        </Button>
      </main>
    </FullScreen>
  );
};

export default Home;
