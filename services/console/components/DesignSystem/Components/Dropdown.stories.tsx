import React from "react";
import { Dropdown, Menu } from "../index";
import { Story } from "@storybook/react";
import { DropdownProps } from "./Dropdown";

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
  parameters: {
    layout: "centered",
  },
};

const menuItems = ["item 1", "item 2"];

const workspacesMenu = <Menu items={menuItems} onClick={() => {}} />;

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
