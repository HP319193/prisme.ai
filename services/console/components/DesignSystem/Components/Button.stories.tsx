import React from "react";
import { ButtonProps } from "./Button";
import { Button } from "../index";
import { Story } from "@storybook/react";

export default {
  title: "Components/Button",
  component: Button,
  argTypes: {
    type: {
      options: ["default", "grey", "link"],
      control: { type: "select" },
    },
  },
  parameters: {
    layout: "centered",
  },
};

const Template: Story<ButtonProps> = (args: any) => (
  <Button {...args}>I am a button !</Button>
);

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
