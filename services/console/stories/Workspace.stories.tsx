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
} from "../components/DesignSystem";
import { LayoutProps } from "../components/DesignSystem/Layout";
import { Story } from "@storybook/react";
import { FeedLayoutHeader, itemsWithCollapseContent } from "./mockData";

export default {
  title: "Pages/WorkspaceHome",
  parameters: {
    layout: "fullscreen",
  },
};

const HeaderComponent = (
  <Header
    workspaces={["mon premier workspace", "mon second workspace"]}
    shareText={"Partager"}
    userName={"John Doe"}
    userAvatar={
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/240px-User-avatar.svg.png"
    }
  />
);

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
    className="border border-solid grow h-full rounded p-4 m-2"
    Header={AutomationsHeader}
    Content={SidePanelContent}
  />
);

const RightColumn = (
  <Layout Header={RightColumnHeader} Content={AutomationsContent} />
);

const Template: Story<LayoutProps> = ({ Header, PageHeader, Content }) => (
  <Layout Header={Header} PageHeader={PageHeader} Content={Content} />
);

const LeftContent = (
  <Feed className="p-4 m-2" sections={itemsWithCollapseContent} />
);

const LeftColumn = <Layout Header={FeedLayoutHeader} Content={LeftContent} />;

const WorkspaceContent = (
  <Row className="grow">
    <Col span={18} className="flex">
      {LeftColumn}
    </Col>
    <Col span={6} className="flex">
      {RightColumn}
    </Col>
  </Row>
);

export const Default = Template.bind({});
Default.args = {
  Header: HeaderComponent,
  Content: WorkspaceContent,
};
