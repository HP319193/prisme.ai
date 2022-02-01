import { Header, Layout, Menu, PageHeader } from "../components/DesignSystem";
import "./no-padding.css";
import { Story } from "@storybook/react";
import { PageHeaderProps } from "../components/DesignSystem/PageHeader";
import { LayoutProps } from "antd";
import { MailOutlined } from "@ant-design/icons";

export default {
  title: "Layout/Layout",
  component: Layout,
};

const handleClick = () => {
  console.log("click ");
};

// const headerMenu = (
//   <Menu onClick={this.handleClick} selectedKeys={[current]} mode="horizontal">
//     <Menu.Item key="mail" icon={<MailOutlined />}>
//       Navigation One
//     </Menu.Item>
//   </Menu>
// );

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

const Template: Story<LayoutProps> = (args) => (
  <Layout
    Header={HeaderComponent}
    PageHeader={CurrentPageHeader}
    Content={BodyComponent}
  />
);

export const Default = Template.bind({});

const ContentColumnTemplate: Story<LayoutProps> = (args) => (
  <Layout Header={HeaderComponent} Content={BodyComponent} />
);

export const ContentColumn = ContentColumnTemplate.bind({});
