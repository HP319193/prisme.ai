import { Layout, PageHeader } from "../components/DesignSystem";
import "./no-padding.css";
import { Story } from "@storybook/react";
import { PageHeaderProps } from "../components/DesignSystem/PageHeader";

export default {
  title: "Layout/Layout",
};

const CurrentPageHeader = (
  <PageHeader onBack={() => {}} title={"Send mail automation"} />
);

const BodyComponent = <div>Hello {"i'm"} the body</div>;
const HeaderComponent = <div>Prisme.ai header</div>;

const Template: Story<PageHeaderProps> = (args: any) => (
  <Layout
    Header={HeaderComponent}
    PageHeader={CurrentPageHeader}
    Content={BodyComponent}
  />
);

export const Default = Template.bind({});
