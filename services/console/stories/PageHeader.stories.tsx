import { Button, PageHeader } from "../components/DesignSystem";
import { PageHeaderProps } from "../components/DesignSystem/PageHeader";
import { Story } from "@storybook/react";

export default {
  title: "Layout/PageHeader",
  component: PageHeader,
  parameters: {
    layout: "padded",
  },
};

const RightButtons = [
  <Button type="grey" key="1">
    Button 1
  </Button>,
  <Button key="2">Button 2</Button>,
];

const Template: Story<PageHeaderProps> = (args: any) => (
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
