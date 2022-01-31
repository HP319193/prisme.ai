import { Layout, PageHeader } from "../components/DesignSystem";
import "./no-padding.css";

export default {
  title: "Layout/Layout",
};

const CurrentPageHeader = <PageHeader title={"Send mail automation"} />;

const Template = (args) => (
  <Layout
    Header={CurrentPageHeader}
    PageHeader={CurrentPageHeader}
    Content={CurrentPageHeader}
  />
);

export const Default = Template.bind({});
