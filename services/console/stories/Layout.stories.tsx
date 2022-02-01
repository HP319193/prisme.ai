import {
  Header,
  Layout,
  MenuTab,
  PageHeader,
  Row,
  Space,
  Button,
  Col,
} from "../components/DesignSystem";
import { LayoutProps } from "../components/DesignSystem/Layout";
import "./no-padding.css";
import { Story } from "@storybook/react";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";

export default {
  title: "Layout/Layout",
  component: Layout,
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

const CurrentPageHeader = (
  <PageHeader onBack={() => {}} title={"Send mail automation"} />
);

const BodyComponent = (
  <div className="h-full bg-slate-200 flex items-center justify-center">
    page content
  </div>
);

const Template: Story<LayoutProps> = ({ Header, PageHeader, Content }) => (
  <Layout Header={Header} PageHeader={PageHeader} Content={Content} />
);

export const Default = Template.bind({});
Default.args = {
  Header: HeaderComponent,
  PageHeader: CurrentPageHeader,
  Content: BodyComponent,
};

export const ContentColumn = Template.bind({});
ContentColumn.args = {
  Header: HeaderComponent,
  Content: BodyComponent,
};

const RightColumnHeader = (
  <MenuTab items={["Apps", "Automations"]} onSelect={() => {}} />
);
const RightColumn = (
  <Layout Header={RightColumnHeader} Content={BodyComponent} />
);

export const RightSection = Template.bind({});
RightSection.args = {
  Header: RightColumnHeader,
  Content: BodyComponent,
};

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
const LeftColumn = <Layout Header={LeftColumnHeader} Content={BodyComponent} />;

const WorkspaceContent = (
  <Row>
    <Col span={18}>{LeftColumn}</Col>
    <Col span={6}>{RightColumn}</Col>
  </Row>
);

export const WorkspaceLayout = Template.bind({});
WorkspaceLayout.args = {
  Header: HeaderComponent,
  Content: WorkspaceContent,
};
