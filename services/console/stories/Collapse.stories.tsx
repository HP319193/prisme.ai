import React from "react";
import { Collapse } from "../components/DesignSystem";
import { Story } from "@storybook/react";
import { CollapseProps } from "../components/DesignSystem/Collapse";

export default {
  title: "Components/Collapse",
  component: Collapse,
  argsType: {
    items: {
      control: {
        type: "array",
      },
    },
  },
  parameters: {
    layout: "padded",
  },
};

const collapseItems = [
  {
    label: "MyWebsite received a contact form",
    content: "New submission with the user John doe requesting a demo",
  },
  {
    label: "Email received",
    content: "Hi, I want to know if everything I need is possible",
  },
];

const Template: Story<CollapseProps> = ({ items }) => (
  <Collapse items={items} />
);

export const Default = Template.bind({});
Default.args = {
  items: collapseItems,
};

export const NoItemsInMenu = Template.bind({});
NoItemsInMenu.args = {
  items: undefined,
};
