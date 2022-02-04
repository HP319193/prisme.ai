import { Story } from "@storybook/react";
import SidePanelAutomations, {
  SidePanelAutomationsProps,
} from "./SidePanelAutomations";

export default {
  title: "Groups/SidePanelAutomations",
  component: SidePanelAutomations,
  parameters: {
    layout: "fullscreen",
  },
};

const Template: Story<SidePanelAutomationsProps> = ({}) => (
  <SidePanelAutomations />
);

export const Default = Template.bind({});
Default.args = {};
