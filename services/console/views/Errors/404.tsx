import Link from "next/link";
import { FC } from "react";
import { useTranslation } from "react-i18next";

interface Error404Props {
  link?: string;
  reason?: string;
}

export const Error404: FC<Error404Props> = ({ link = "/", reason }) => {
  const { t } = useTranslation("errors");

  return (
    <Link href={link}>
      {(reason && t(reason, { defaultValue: reason })) || t("404")}
    </Link>
  );
};

export default Error404;
