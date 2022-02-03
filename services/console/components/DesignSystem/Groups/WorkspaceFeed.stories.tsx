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
  sections: [
    {
      title: "Today",
      content: [
        { label: "This is an entry", content: "and its corresponding text" },
        { label: "This is an entry", content: "and its corresponding text" },
        { label: "This is an entry", content: "and its corresponding text" },
      ],
    },
    {
      title: "Yesterday",
      content: [
        { label: "This is an entry", content: "and its corresponding text" },
        { label: "This is an entry", content: "and its corresponding text" },
        { label: "This is an entry", content: "and its corresponding text" },
      ],
    },
    {
      title: "Friday 11/11/2021",
      content: [
        { label: "This is an entry", content: "and its corresponding text" },
        { label: "This is an entry", content: "and its corresponding text" },
        { label: "This is an entry", content: "and its corresponding text" },
      ],
    },
  ],
};
