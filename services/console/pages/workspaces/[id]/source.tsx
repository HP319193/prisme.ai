import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export { default } from "../../../views/Workspace";

export const getServerSideProps: GetServerSideProps = async ({
  locale = "",
}) => ({
  props: {
    ...(await serverSideTranslations(locale, [
      "common",
      "workspaces",
      "errors",
    ])),
  },
});
