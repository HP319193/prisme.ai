import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export { default } from "../../views/Workspaces";

export const getServerSideProps: GetServerSideProps = async ({
  locale = "",
}) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common", "workspaces"])),
  },
});
