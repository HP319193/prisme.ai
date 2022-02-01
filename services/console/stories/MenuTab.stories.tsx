import { Story } from "@storybook/react";
import { MenuTab } from "../components/DesignSystem";
import "./no-padding.css";

import { action } from "@storybook/addon-actions";

const actionsData = {
  onSelect: action("onSelect"),
};

export default {
  title: "Components/MenuTab",
  component: MenuTab,
  argsType: {
    items: {
      control: {
        type: "array",
      },
    },
  },
};

const Template: Story = ({ onSelect, items = [] }) => (
  <MenuTab items={items} onSelect={onSelect} />
);

export const Default = Template.bind({});
Default.args = {
  items: ["Automations", "Apps"],
};
