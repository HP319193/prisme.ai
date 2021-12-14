import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export { default } from "../views/Sign/In";

export const getServerSideProps: GetServerSideProps = async ({
  locale = "",
}) => ({
  props: {
    ...(await serverSideTranslations(locale, ["sign"])),
  },
});
