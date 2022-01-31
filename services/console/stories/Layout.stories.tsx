import { Header, Layout, PageHeader } from "../components/DesignSystem";
import "./no-padding.css";
import { Story } from "@storybook/react";
import { PageHeaderProps } from "../components/DesignSystem/PageHeader";

export default {
  title: "Layout/Layout",
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

const Template: Story<PageHeaderProps> = (args: any) => (
  <Layout
    Header={HeaderComponent}
    PageHeader={CurrentPageHeader}
    Content={BodyComponent}
  />
);

export const Default = Template.bind({});
