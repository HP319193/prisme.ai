import { Story } from "@storybook/react";
import { Header } from "../components/DesignSystem";
import "./no-padding.css";

export default {
  title: "Layout/Header",
};

const Template: Story = () => (
  <Header
    workspaces={["mon premier workspace", "mon second workspace"]}
    shareText={"Partager"}
    userName={"John Doe"}
    userAvatar={
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/240px-User-avatar.svg.png"
    }
  />
);

export const Default = Template.bind({});
