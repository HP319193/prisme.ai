import { Header } from "../components/DesignSystem";
import "./no-padding.css";
import { Story } from "@storybook/react";

export default {
  title: "Layout/Header",
};

const Template: Story = () => <Header />;

export const Default = Template.bind({});
