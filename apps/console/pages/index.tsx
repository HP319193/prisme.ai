import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const { t } = useTranslation("common");
  return (
    <div className={styles.container}>
      <Head>
        <title>Prisme.ai Console</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{t("hello.world")}</h1>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  locale = "",
}) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default Home;
