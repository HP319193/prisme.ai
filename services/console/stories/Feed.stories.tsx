import React from "react";
import { Collapse, Feed } from "../components/DesignSystem";
import { Story } from "@storybook/react";
import { FeedProps, Section } from "../components/DesignSystem/Feed";
import { itemsWithCollapseContent } from "./mockData";

export default {
  title: "Layout/Feed",
  component: Feed,
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

const feedItems: Section[] = [
  { title: "First section", content: <div>Content 1</div> },
  { title: "Second section", content: <div>Content 2</div> },
];

const Template: Story<FeedProps> = ({ sections }) => (
  <Feed sections={sections} />
);

export const Default = Template.bind({});
Default.args = {
  sections: feedItems,
};

export const WithCollapseSections = Template.bind({});
WithCollapseSections.args = {
  sections: itemsWithCollapseContent,
};
