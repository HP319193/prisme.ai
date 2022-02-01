import {
  Header,
  Layout,
  MenuTab,
  Row,
  Space,
  Button,
  Col,
  Feed,
} from "../components/DesignSystem";
import { LayoutProps } from "../components/DesignSystem/Layout";
import { Story } from "@storybook/react";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { itemsWithCollapseContent } from "./mockData";

export default {
  title: "Pages/Layout",
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
const RightColumn = (
  <Layout Header={RightColumnHeader} Content={<div>TODO</div>} />
);

const Template: Story<LayoutProps> = ({ Header, PageHeader, Content }) => (
  <Layout Header={Header} PageHeader={PageHeader} Content={Content} />
);

const LeftColumnHeader = (
  <Space className="h-8">
    <Button>
      <Space>
        <FilterOutlined />
        Filter
      </Space>
    </Button>
    <Button type="grey">
      <Space>
        <SearchOutlined />
        Search
      </Space>
    </Button>
  </Space>
);

const LeftContent = <Feed sections={itemsWithCollapseContent} />;

const LeftColumn = <Layout Header={LeftColumnHeader} Content={LeftContent} />;

const WorkspaceContent = (
  <Row>
    <Col span={18} className="p-4">
      {LeftColumn}
    </Col>
    <Col span={6}>{RightColumn}</Col>
  </Row>
);

export const Default = Template.bind({});
Default.args = {
  Header: HeaderComponent,
  Content: WorkspaceContent,
};
