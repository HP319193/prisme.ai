import { Story } from "@storybook/react";
import { WorkspaceFeed } from "../";
import { WorkspaceFeedProps } from "./WorkspaceFeed";

export default {
  title: "Groups/WorkspaceFeed",
  component: WorkspaceFeed,
  parameters: {
    layout: "fullscreen",
  },
};

const Template: Story<WorkspaceFeedProps> = ({ sections }) => (
  <WorkspaceFeed sections={sections} />
);

export const Default = Template.bind({});
Default.args = {
  sections: [{ title: "Today", content: [{ label: "hello", content: "hey" }] }],
};
