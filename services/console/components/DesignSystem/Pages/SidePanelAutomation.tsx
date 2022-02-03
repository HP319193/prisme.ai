import React from "react";
import { Space } from "../";
import SearchInput from "../Components/SearchInput";
import { useTranslation } from "react-i18next";

const SidePanelAutomation = () => {
  const { t } = useTranslation("workspaces");
  return (
    <Space>
      <SearchInput placeholder={t("search")} />
    </Space>
  );
};

export default SidePanelAutomation;
