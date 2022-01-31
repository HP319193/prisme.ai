import React from "react";
import { Button } from "../components/DesignSystem";

export default {
  title: "Components/Button",
  component: Button,
  argTypes: {
    type: {
      options: ["default", "grey", "link"],
      control: { type: "select" },
    },
  },
};

const Template = (args) => <Button {...args}>I am a button !</Button>;

export const Default = Template.bind({});
Default.args = {
  type: "default",
};

export const Grey = Template.bind({});
Grey.args = {
  type: "grey",
};

export const Link = Template.bind({});
Link.args = {
  type: "link",
};
