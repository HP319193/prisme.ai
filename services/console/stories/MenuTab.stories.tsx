import { Story } from "@storybook/react";
import { MenuTab } from "../components/DesignSystem";
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
  parameters: {
    layout: "centered",
  },
};

const Template: Story = ({ onSelect, items = [] }) => (
  <MenuTab items={items} onSelect={onSelect} />
);

export const Default = Template.bind({});
Default.args = {
  items: ["Automations", "Apps"],
};
