import {
  Header,
  Layout,
  MenuTab,
  Row,
  Col,
  Feed,
  Space,
  Title,
  Button,
} from "../";
import { useTranslation } from "react-i18next";

const RightColumnHeader = (
  <MenuTab items={["Apps", "Automations"]} onSelect={() => {}} />
);

const SidePanelContent = <Space></Space>;
const AutomationsHeader = (
  <div className="flex justify-between items-center">
    <Title level={4} className="mb-0">
      Automations
    </Title>
    <Button>+ Add an automation</Button>
  </div>
);
const AutomationsContent = (
  <Layout
    className="border border-gray border-solid grow h-full rounded p-4 m-2"
    Header={AutomationsHeader}
  >
    {SidePanelContent}
  </Layout>
);

const RightColumn = (
  <Layout Header={RightColumnHeader}>{AutomationsContent}</Layout>
);

// const LeftContent = (
//   <Feed className="p-4 m-2" sections={itemsWithCollapseContent} />
// );
//
// const LeftColumn = <Layout Header={FeedLayoutHeader} Content={LeftContent} />;

const WorkspaceContent = (
  <Row className="grow">
    <Col span={18} className="flex">
      {/*{LeftColumn}*/}
    </Col>
    <Col span={6} className="flex">
      {RightColumn}
    </Col>
  </Row>
);

const WorkspaceHome = ({}: any) => {
  const { t } = useTranslation("workspaces");

  // Hooks mocks
  const workspacesNames = ["mon premier workspace", "mon second workspace"];
  const user = {
    name: "John Doe",
    avatar:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/240px-User-avatar.svg.png",
  };

  const SiteHeader = (
    <Header
      workspaces={workspacesNames}
      shareText={t("share")}
      userName={user.name}
      userAvatar={user.avatar}
    />
  );

  return <Layout Header={SiteHeader}>{WorkspaceContent}</Layout>;
};

export default WorkspaceHome;
