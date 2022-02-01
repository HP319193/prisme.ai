import {
  Header,
  Layout,
  MenuTab,
  PageHeader,
  Row,
  Space,
  Button,
  Col,
  Feed,
} from "../components/DesignSystem";
import { LayoutProps } from "../components/DesignSystem/Layout";
import { Story } from "@storybook/react";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { FeedLayoutHeader, itemsWithCollapseContent } from "./mockData";

export default {
  title: "Layout/Layout",
  component: Layout,
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

const PageHeaderButtons = [
  <Button type="grey" key="1">
    Button 1
  </Button>,
  <Button key="2">Button 2</Button>,
];
const CurrentPageHeader = (
  <PageHeader
    onBack={() => {}}
    title={"Send mail automation"}
    RightButtons={PageHeaderButtons}
  />
);

const BodyComponent = (
  <div className="h-full bg-slate-200 flex">page content</div>
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

const RightColumnHeader = (
  <MenuTab items={["Apps", "Automations"]} onSelect={() => {}} />
);
const RightColumn = (
  <Layout Header={RightColumnHeader} Content={BodyComponent} />
);

export const SidePanelExample = Template.bind({});
SidePanelExample.args = {
  Header: RightColumnHeader,
  Content: BodyComponent,
};

const LeftContent = <Feed sections={itemsWithCollapseContent} />;
export const WorkspaceFeedLayout = Template.bind({});
WorkspaceFeedLayout.args = {
  Header: FeedLayoutHeader,
  Content: LeftContent,
};
