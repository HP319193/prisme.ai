import React from "react";
import { Dropdown, Menu } from "../components/DesignSystem";
import { Story } from "@storybook/react";
import { DropdownProps } from "../components/DesignSystem/Dropdown";

export default {
  title: "Components/Dropdown",
  component: Dropdown,
  argsType: {
    items: {
      control: {
        type: "array",
      },
    },
  },
};

const menuItems = ["item 1", "item 2"];

const workspacesMenu = <Menu items={menuItems} />;

const Template: Story<DropdownProps> = ({ Menu }) => (
  <Dropdown Menu={Menu}>I am a dropdown !</Dropdown>
);

export const Default = Template.bind({});
Default.args = {
  Menu: workspacesMenu,
};

export const NoItemsInMenu = Template.bind({});
NoItemsInMenu.args = {
  Menu: undefined,
};
