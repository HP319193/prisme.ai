import React from "react";
import { SearchInput } from "../index";
import { Story } from "@storybook/react";
import { SearchInputProps } from "./SearchInput";
import { action } from "@storybook/addon-actions";

const actionsData = {
  onSelect: action("onSelect"),
};
export default {
  title: "Components/SearchInput",
  component: SearchInput,
  argsType: {
    placeholder: {
      type: { name: "string", required: false },
    },
  },
  parameters: {
    layout: "centered",
  },
};

const Template: Story<SearchInputProps> = ({ placeholder, onPressEnter }) => (
  <SearchInput placeholder={placeholder} onPressEnter={onPressEnter} />
);

export const Default = Template.bind({});
Default.args = {
  placeholder: "Search something",
};
