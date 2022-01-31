import { Button, PageHeader } from "../components/DesignSystem";
import "./no-padding.css";

export default {
  title: "Layout/PageHeader",
};

const RightButtons = [
  <Button type="grey">Button 1</Button>,
  <Button>Button 2</Button>,
];

const Template = (args) => (
  <PageHeader title={"Send mail automation"} {...args} />
);

export const Default = Template.bind({});
Default.args = {
  RightButtons: RightButtons,
};

export const WithoutButtons = Template.bind({});
WithoutButtons.args = {
  RightButtons: undefined,
};
