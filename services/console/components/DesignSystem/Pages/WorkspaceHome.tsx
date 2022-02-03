import { Header, Layout, Row, Col } from "../";
import { useTranslation } from "react-i18next";
import React from "react";
import SidePanel from "./SidePanel";
import WorkspaceFeed from "./WorkspaceFeed";

const WorkspaceHome = ({}: any) => {
  const { t } = useTranslation("workspaces");

  // Start hooks mocks
  const workspacesNames = ["mon premier workspace", "mon second workspace"];
  const user = {
    name: "John Doe",
    avatar:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/240px-User-avatar.svg.png",
  };
  // End hooks mocks

  return (
    <Layout
      Header={
        <Header
          workspaces={workspacesNames}
          shareText={t("share")}
          userName={user.name}
          userAvatar={user.avatar}
        />
      }
    >
      <Row className="grow">
        <Col span={18} className="flex">
          <WorkspaceFeed />
        </Col>
        <Col span={6} className="flex">
          <SidePanel />
        </Col>
      </Row>
    </Layout>
  );
};

export default WorkspaceHome;
