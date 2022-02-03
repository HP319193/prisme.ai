import { Header, Layout, MenuTab, PageHeader, Button, Feed } from "./index";
import { LayoutProps } from "./Layout";
import { Story } from "@storybook/react";
import {
  FeedLayoutHeader,
  itemsWithCollapseContent,
} from "../../stories/mockData";

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
  <div className="h-full bg-slate-200 flex items-center justify-center grow">
    page content
  </div>
);

const Template: Story<LayoutProps> = ({ Header, PageHeader, children }) => (
  <Layout Header={Header} PageHeader={PageHeader}>
    {children}
  </Layout>
);

export const Default = Template.bind({});
Default.args = {
  Header: HeaderComponent,
  PageHeader: CurrentPageHeader,
  children: BodyComponent,
};

const RightColumnHeader = (
  <MenuTab items={["Apps", "Automations"]} onSelect={() => {}} />
);

export const SidePanelExample = Template.bind({});
SidePanelExample.args = {
  Header: RightColumnHeader,
  children: BodyComponent,
};

const LeftContent = <Feed sections={itemsWithCollapseContent} />;
export const WorkspaceFeedLayout = Template.bind({});
WorkspaceFeedLayout.args = {
  Header: FeedLayoutHeader,
  children: LeftContent,
};
